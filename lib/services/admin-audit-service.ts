
import { prisma } from "../db";

export class AdminAuditService {
    /**
     * Log any administrative action.
     * Captures WHO, WHEN, WHAT, and WHICH module.
     */
    static async log({
        adminId,
        action,
        entityId,
        details,
        before,
        after,
        ip
    }: {
        adminId: string;
        action: string;
        entityId?: string;
        details: string;
        before?: any;
        after?: any;
        ip?: string;
    }) {
        try {
            return await prisma.adminAuditLog.create({
                data: {
                    admin_id: adminId,
                    action,
                    resource: entityId,
                    details: {
                        description: details,
                        before_value: before,
                        after_value: after
                    } as any,
                    ip_address: ip
                }
            });
        } catch (e) {
            console.error("Audit Logging Failed:", e);
        }
    }

    /**
     * Specifically for CRM activities that might need to be tracked on the lead itself
     */
    static async logCRMActivity(leadId: string, adminId: string, action: string, description: string) {
        return await prisma.cRMActivity.create({
            data: {
                lead_id: leadId,
                admin_id: adminId,
                action,
                description
            }
        });
    }
}
