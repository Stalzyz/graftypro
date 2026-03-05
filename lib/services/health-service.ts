import { prisma } from "../db";
import { WhatsAppService } from "../whatsapp/service";
import { decrypt } from "../security/encryption";

export class IntegrationHealthService {

    /**
     * Run a health check on all active integrations (Phase 5)
     */
    static async checkAllIntegrations() {
        console.log("⏱️ Starting Global Integration Health Check...");

        const accounts = await prisma.whatsAppAccount.findMany({
            where: {
                integration_status: {
                    in: ["ACTIVE", "DEGRADED"]
                }
            }
        });

        for (const account of accounts) {
            await this.validateAccountHealth(account.id);
        }
    }

    /**
     * Check health for a single account
     */
    static async validateAccountHealth(accountId: string) {
        const account = await prisma.whatsAppAccount.findUnique({
            where: { id: accountId }
        });

        if (!account) return;

        console.log(`🔍 Checking Health for WABA ${account.waba_id}...`);

        let decryptedToken = account.access_token;

        // Try to decrypt if it looks like encrypted format (contains :)
        if (account.access_token && account.access_token.includes(":")) {
            try {
                decryptedToken = decrypt(account.access_token);
            } catch (err) {
                console.error(`Health Check: Failed to decrypt token for ${account.id}`);
                // Don't update status to CRITICAL yet, maybe it wasn't encrypted?
            }
        }

        const validation = await WhatsAppService.validateCredentials(
            account.phone_number_id,
            decryptedToken
        );

        const newHealthStatus = validation.success ? "HEALTHY" : "CRITICAL";
        let newIntegrationStatus = validation.success ? "ACTIVE" : "DEGRADED";

        // AUTO-PAUSE LOGIC (PHASE 7)
        const currentFailures = (account as any).consecutive_failures || 0;
        const newFailures = validation.success ? 0 : currentFailures + 1;

        if (newFailures >= 5) {
            newIntegrationStatus = "SUSPENDED";
            console.error(`⛔ AUTO-SUSPENDING integration ${account.id} due to 5 consecutive failures.`);

            // Log Audit Event
            await prisma.integrationAuditLog.create({
                data: {
                    whatsapp_account_id: accountId,
                    workspace_id: account.workspace_id,
                    action: "AUTO_SUSPENDED",
                    details: {
                        reason: "CONSECUTIVE_FAILURES",
                        last_error: validation.error
                    }
                }
            });
        }

        await prisma.whatsAppAccount.update({
            where: { id: accountId },
            data: {
                health_status: newHealthStatus as any,
                integration_status: newIntegrationStatus as any,
                last_health_check_at: new Date(),
                // @ts-ignore
                consecutive_failures: newFailures
            }
        });

        // Log to Health Logs
        await prisma.integrationHealthLog.create({
            data: {
                whatsapp_account_id: accountId,
                check_type: "TOKEN_VALIDITY",
                status: validation.success ? "PASS" : "FAIL",
                details: (validation.data as any) || {},
                error_message: validation.error || null
            }
        });

        if (!validation.success) {
            console.warn(`🚨 WABA ${account.waba_id} is ${newHealthStatus}: ${validation.error}`);
        }
    }
}
