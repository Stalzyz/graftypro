import { prisma } from "../db";
import nodemailer from "nodemailer";
import { SystemConfigService } from "../services/system-config-service";

export class EmailService {
    /**
     * Create a transporter using system configuration
     */
    static async getTransporter() {
        // Try database config first
        const config = await SystemConfigService.getConfig();
        const secrets = await SystemConfigService.getDecryptedSecrets();

        // Fallback to environment variables if database config not set or empty
        const smtpHost = (config.smtp_host && config.smtp_host.trim() !== "") ? config.smtp_host : process.env.SMTP_HOST;
        const smtpPort = Number(config.smtp_port) || parseInt(process.env.SMTP_PORT || "587");
        const smtpUser = (config.smtp_user && config.smtp_user.trim() !== "") ? config.smtp_user : process.env.SMTP_USER;
        const smtpPass = (secrets.smtp_pass && secrets.smtp_pass.trim() !== "") ? secrets.smtp_pass : process.env.SMTP_PASS;

        // Logic: Port 465 is ALWAYS SSL (secure: true). All others (587, 25) are STARTTLS (secure: false).
        // If config specifies SSL, we honor it, otherwise we infer from port.
        const smtpSecure = smtpPort === 465 || config.smtp_encryption === "SSL";

        if (!smtpHost || !smtpUser || !smtpPass) {
            console.warn("⚠️ SMTP not configured. Emails will not be sent.", { smtpHost, smtpUser, hasPass: !!smtpPass });
            return null;
        }

        return nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpSecure,
            auth: {
                user: smtpUser,
                pass: smtpPass
            },
            tls: {
                // Do not fail on invalid certs (common for PrivateEmail/Namecheap)
                rejectUnauthorized: false
            }
        });
    }

    /**
     * Sends a branded email.
     */
    static async sendBrandedEmail(workspaceId: string, options: {
        to: string;
        subject: string;
        templateName: string;
        context: any;
        attachments?: any[];
    }) {
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: {
                reseller: true
            }
        });

        const config = await SystemConfigService.getConfig();

        // 1. Resolve Branding
        const brandName = workspace?.reseller?.brand_name || config.platform_name || "Grafty";
        const logoUrl = workspace?.reseller?.logo_url || config.logo_url || "https://grafty.pro/logo.png";
        const fromEmail = config.smtp_from_email || "no-reply@grafty.pro";
        const fromName = workspace?.reseller?.brand_name || config.smtp_from_name || brandName;

        // 2. Prepare HTML with Template Logic
        let contentHtml = "";

        if (options.templateName === "OTP_VERIFICATION") {
            contentHtml = `
                <h1 style="color: #111; font-size: 24px;">Security Verification</h1>
                <p>Please use the following single-use code to verify your identity. This code will expire in 10 minutes.</p>
                <div style="background: #f4f4f4; padding: 24px; text-align: center; border-radius: 12px; margin: 24px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #27954D;">${options.context.otp}</span>
                </div>
                <p style="font-size: 13px; color: #666;">If you did not request this code, please secure your account immediately or contact support.</p>
            `;
        } else {
            contentHtml = options.context.body_content || JSON.stringify(options.context);
        }

        const html = `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 24px;">
                <div style="text-align: left; margin-bottom: 32px;">
                    <img src="${logoUrl}" alt="${brandName}" style="height: 40px;">
                </div>
                <div style="line-height: 1.6; color: #333;">
                    ${contentHtml}
                </div>
                <hr style="margin-top: 40px; border: 0; border-top: 1px solid #f0f0f0;">
                <div style="text-align: center; font-size: 12px; color: #999; margin-top: 20px;">
                    Sent by ${brandName} Security &middot; &copy; ${new Date().getFullYear()}
                </div>
            </div>
        `;

        const transporter = await this.getTransporter();
        if (!transporter) return { success: false, message: "SMTP not configured" };

        try {
            await transporter.sendMail({
                from: `"${fromName}" <${fromEmail}>`,
                to: options.to,
                subject: options.subject,
                html: html,
                attachments: options.attachments
            });

            return { success: true };
        } catch (error: any) {
            console.error("📧 Email Sending Failed:", error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send a system-level email using global config (No workspace branding)
     */
    static async sendSystemEmail(options: { to: string; subject: string; templateName: string; context: any }) {
        const config = await SystemConfigService.getConfig();
        const secrets = await SystemConfigService.getDecryptedSecrets();

        const brandName = config.platform_name || "Grafty";
        const logoUrl = config.logo_url || "https://grafty.pro/logo.png";

        // Robust fallback logic: prioritize DB config IF it's not empty, otherwise use ENV
        const fromEmail = (config.smtp_from_email && config.smtp_from_email.trim() !== "")
            ? config.smtp_from_email
            : (process.env.SMTP_FROM_EMAIL || "no-reply@grafty.pro");

        const fromName = (config.smtp_from_name && config.smtp_from_name.trim() !== "")
            ? config.smtp_from_name
            : (config.smtp_from_name || process.env.SMTP_FROM_NAME || brandName);

        console.log(`[EmailService] Preparing system email to: ${options.to} via ${fromEmail}`);

        let contentHtml = "";
        if (options.templateName === "OTP_VERIFICATION") {
            contentHtml = `
                <h1 style="color: #111; font-size: 24px;">Security Verification</h1>
                <p>Please use the following single-use code to verify your identity.</p>
                <div style="background: #f4f4f4; padding: 24px; text-align: center; border-radius: 12px; margin: 24px 0;">
                    <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #27954D;">${options.context.otp}</span>
                </div>
            `;
        } else if (options.templateName === "VERIFY_EMAIL") {
            const url = options.context.verification_url;
            contentHtml = `
                <div style="text-align: center;">
                    <h1 style="color: #111; font-size: 24px; margin-bottom: 16px;">Verify your email</h1>
                    <p style="color: #555; font-size: 16px; margin-bottom: 32px;">Please confirm your email address to activate your account and access the dashboard.</p>
                    <a href="${url}" style="background-color: #27954D; color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(39, 149, 77, 0.2);">Verify Account</a>
                    <p style="color: #999; font-size: 12px; margin-top: 32px;">Link expires in 24 hours. If you didn't sign up, you can safely ignore this email.</p>
                </div>
            `;
        } else {
            contentHtml = options.context.body_content || JSON.stringify(options.context);
        }

        const html = `
            <div style="font-family: -apple-system, system-ui, sans-serif; max-width: 600px; margin: auto; padding: 40px; border: 1px solid #e2e8f0; border-radius: 24px; background-color: #ffffff;">
                <div style="text-align: center; margin-bottom: 32px;">
                    <img src="${logoUrl}" alt="${brandName}" style="height: 36px;">
                </div>
                ${contentHtml}
                <div style="border-top: 1px solid #f1f5f9; margin-top: 40px; padding-top: 20px; text-align: center;">
                     <p style="color: #94a3b8; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.</p>
                     <p style="color: #94a3b8; font-size: 11px; margin-top: 8px;">
                        This automated message was sent to ${options.to}.
                     </p>
                </div>
            </div>
        `;

        const transporter = await this.getTransporter();
        if (!transporter) {
            console.error("❌ System Email Failed: SMTP configuration is missing or invalid");
            return { success: false, error: "SMTP not configured" };
        }

        try {
            const info = await transporter.sendMail({
                from: `"${fromName}" <${fromEmail}>`,
                to: options.to,
                subject: options.subject,
                html: html
            });
            console.log(`✅ System Email Sent: ${info.messageId}`);
            return { success: true };
        } catch (error: any) {
            console.error("📧 System Email Dispatch Error:", {
                recipient: options.to,
                error: error.message,
                code: error.code,
                command: error.command
            });
            return { success: false, error: error.message };
        }
    }


    /**
     * Test SMTP Connection
     */
    static async testConnection(to: string) {
        const config = await SystemConfigService.getConfig();
        const transporter = await this.getTransporter();

        if (!transporter) throw new Error("SMTP not configured");

        try {
            await transporter.sendMail({
                from: `"${config.smtp_from_name || 'System Test'}" <${config.smtp_from_email}>`,
                to: to,
                subject: "Grafty SMTP Test Connection",
                text: "Success! Your SMTP configuration is working correctly.",
                html: "<b>Success!</b> Your SMTP configuration is working correctly."
            });
            return { success: true };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }
    /**
     * Send Invoice Email with PDF Attachment
     */
    static async sendInvoiceEmailWithAttachment(to: string, invoice: any, pdfBuffer: Buffer) {
        const amountStr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(invoice.total_amount));

        await this.sendBrandedEmail(invoice.workspace_id, {
            to: to,
            subject: `Invoice ${invoice.invoice_number} from ${invoice.company_name}`,
            templateName: 'INVOICE_PURCHASE',
            context: {
                body_content: `
                    <h2>Invoice Generated</h2>
                    <p>Dear ${invoice.billing_name},</p>
                    <p>Thank you for your business. Your payment of <b>${amountStr}</b> has been received successfully.</p>
                    <p><b>Invoice Number:</b> ${invoice.invoice_number}<br>
                    <b>Date:</b> ${new Date(invoice.created_at).toLocaleDateString('en-IN')}</p>
                    <p>Please find the tax invoice attached to this email.</p>
                `
            },
            attachments: [
                {
                    filename: `${invoice.invoice_number}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ]
        });
    }
}
