import { prisma } from "../db";
import { redis } from "../redis";
import { createTopupLink } from "../saas/razorpay";
import { WhatsAppService } from "../whatsapp/service";
import { SystemConfigService } from "../services/system-config-service";

export class SmartAlertService {
    private static ALERT_COOLDOWN_HOURS = 24;

    /**
     * Triggers a Smart Top-up alert via WhatsApp.
     * Includes a professional payment link for one-click recharge.
     */
    static async triggerSmartAlert(workspaceId: string, currentBalance: number) {
        try {
            // 1. Cooldown Protection (Redis-backed)
            const redisKey = `topup_alert_cooldown:${workspaceId}`;
            const onCooldown = await redis.get(redisKey);
            if (onCooldown) {
                console.log(`[Smart Alert] Cooldown active for ${workspaceId}. Skipping alert.`);
                return;
            }

            // 2. Fetch Workspace and Wallet Details
            const wallet = await prisma.vendorWallet.findUnique({
                where: { workspace_id: workspaceId }
            });

            if (!wallet || !wallet.billing_phone) {
                console.warn(`[Smart Alert] Cannot send alert for ${workspaceId}: No billing phone found.`);
                return;
            }

            // 3. Generate Razorpay Payment Link
            // Default top-up amount: ₹1,000 or the set auto_recharge_amount
            const topupAmount = Number(wallet.auto_recharge_amount) || 1000;
            const billingDetails = {
                name: wallet.billing_name,
                email: wallet.billing_email,
                phone: wallet.billing_phone
            };

            const rzpLink = await createTopupLink(workspaceId, topupAmount, billingDetails);
            if (!rzpLink || !rzpLink.short_url) {
                throw new Error("Failed to generate Razorpay Payment Link");
            }

            // 4. Fetch System Meta Credentials
            const config = await SystemConfigService.getConfig();
            const secrets = await SystemConfigService.getDecryptedSecrets();

            if (!config.meta_phone_id || !secrets.meta_permanent_token) {
                console.error("[Smart Alert] System Meta credentials missing. Check Global Settings.");
                return;
            }

            // 5. Build and Send WhatsApp Message (Interactive URL Button)
            const messageBody = `⚠️ *Low Balance Alert*\n\nYour WhatsApp credit balance is low (₹${currentBalance.toLocaleString()}). \n\nTo ensure your active campaigns and automated flows continue working without interruption, please recharge your wallet now.`;

            await WhatsAppService.sendURLButton(
                config.meta_phone_id,
                secrets.meta_permanent_token!,
                wallet.billing_phone,
                messageBody,
                "Recharge Now",
                rzpLink.short_url,
                undefined, // Header
                undefined, // WorkspaceID (sent from system)
                "UTILITY",
                "Automated Top-up Alert"
            );

            // 6. Set Cooldown
            await redis.set(redisKey, "1", "EX", this.ALERT_COOLDOWN_HOURS * 3600);
            console.log(`[Smart Alert] ✅ Top-up alert sent to ${wallet.billing_phone} for workspace ${workspaceId}`);

        } catch (error) {
            console.error("[Smart Alert] Error triggering alert:", error);
        }
    }
}
