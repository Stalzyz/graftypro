
import { EmailService } from "../email/service";
import { WhatsAppService } from "../whatsapp/service";
import { SystemConfigService } from "../services/system-config-service";
import { prisma } from "../db";

export class NotificationService {
    /**
     * Sends a unified Welcome notification (Email + WhatsApp)
     */
    static async sendWelcomeNotification(userId: string) {
        try {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { workspace: true }
            });

            if (!user) return;

            const name = user.first_name || user.email.split('@')[0];
            
            // 1. Send Email
            await EmailService.sendWelcomeEmail(user.workspace_id, user.email, name);

            // 2. Send WhatsApp (If phone exists)
            if (user.phone) {
                const config = await SystemConfigService.getConfig();
                const secrets = await SystemConfigService.getDecryptedSecrets();

                if (config.meta_phone_id && secrets.meta_permanent_token) {
                    const message = `🚀 *Welcome to Grafty, ${name}!* 
                    
We're excited to help you automate your WhatsApp growth.

*Next steps:*
1️⃣ Connect your WABA
2️⃣ Build your first Flow
3️⃣ Scale your business

Login here: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;

                    await WhatsAppService.sendText(
                        config.meta_phone_id,
                        secrets.meta_permanent_token as string,
                        user.phone,
                        message
                    ).catch(e => console.error("WA Welcome failed:", e.message));
                }
            }
        } catch (error: any) {
            console.error("Unified Welcome failed:", error.message);
        }
    }

    /**
     * Sends a unified Invoice notification (Email with PDF + WhatsApp summary)
     */
    static async sendInvoiceNotification(invoiceId: string, pdfBuffer: Buffer) {
        try {
            const invoice = await prisma.invoice.findUnique({
                where: { id: invoiceId },
                include: { workspace: { include: { users: { where: { role: 'ADMIN' }, take: 1 } } } }
            });

            if (!invoice || !invoice.workspace) return;

            const admin = invoice.workspace.users[0];
            if (!admin) return;

            const amountStr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(invoice.total_amount));

            // 1. Send Email with PDF
            await EmailService.sendInvoiceEmailWithAttachment(admin.email, invoice, pdfBuffer);

            // 2. Send WhatsApp Summary (If phone exists)
            if (admin.phone) {
                const config = await SystemConfigService.getConfig();
                const secrets = await SystemConfigService.getDecryptedSecrets();

                if (config.meta_phone_id && secrets.meta_permanent_token) {
                    const message = `📄 *Invoice Generated: ${invoice.invoice_number}*

Hello ${admin.first_name || 'there'}, 

Your payment of *${amountStr}* has been confirmed.

A detailed tax invoice has been sent to your email: ${admin.email}.

Thank you for choosing Grafty!`;

                    await WhatsAppService.sendText(
                        config.meta_phone_id,
                        secrets.meta_permanent_token as string,
                        admin.phone,
                        message
                    ).catch(e => console.error("WA Invoice failed:", e.message));
                }
            }
        } catch (error: any) {
            console.error("Unified Invoice failed:", error.message);
        }
    }
}
