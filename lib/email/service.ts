import { prisma } from "../db";
import nodemailer from "nodemailer";
import { SystemConfigService } from "../services/system-config-service";

export class EmailService {
    /**
     * Create a transporter using system configuration
     */
    static async getTransporter(resellerId?: string) {
        let smtpHost = process.env.SMTP_HOST;
        let smtpPort = parseInt(process.env.SMTP_PORT || "587");
        let smtpUser = process.env.SMTP_USER;
        let smtpPass = process.env.SMTP_PASS;
        let encryption = "STARTTLS";

        // 1. Check for Reseller-specific SMTP
        if (resellerId) {
            const reseller = await prisma.reseller.findUnique({
                where: { id: resellerId },
                select: { smtp_config: true }
            });

            if (reseller?.smtp_config) {
                const rConf = reseller.smtp_config as any;
                if (rConf.host && rConf.user && (rConf.pass || rConf.pass_enc)) {
                    smtpHost = rConf.host;
                    smtpPort = Number(rConf.port) || 587;
                    smtpUser = rConf.user;
                    
                    if (rConf.pass_enc) {
                        const { decrypt } = require("../security/encryption");
                        smtpPass = decrypt(rConf.pass_enc);
                    } else {
                        smtpPass = rConf.pass;
                    }
                    
                    encryption = rConf.encryption || (smtpPort === 465 ? "SSL" : "STARTTLS");
                    
                    return nodemailer.createTransport({
                        host: smtpHost,
                        port: smtpPort,
                        secure: smtpPort === 465 || encryption === "SSL",
                        auth: { user: smtpUser, pass: smtpPass },
                        tls: { rejectUnauthorized: false }
                    });
                }
            }
        }

        // 2. Fallback to Database System Config
        const config = await SystemConfigService.getConfig();
        const secrets = await SystemConfigService.getDecryptedSecrets();

        if (config.smtp_host) smtpHost = config.smtp_host;
        if (config.smtp_port) smtpPort = Number(config.smtp_port);
        if (config.smtp_user) smtpUser = config.smtp_user;
        if (secrets.smtp_pass) smtpPass = secrets.smtp_pass;
        encryption = config.smtp_encryption || (smtpPort === 465 ? "SSL" : "STARTTLS");

        if (!smtpHost || !smtpUser || !smtpPass) {
            console.warn("⚠️ SMTP not configured. Emails will not be sent.", { smtpHost, smtpUser, hasPass: !!smtpPass });
            return null;
        }

        return nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465 || encryption === "SSL",
            auth: { user: smtpUser, pass: smtpPass },
            tls: { rejectUnauthorized: false }
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

        // 1. Resolve Branding & Identity
        const rSmtp = (workspace?.reseller?.smtp_config as any);
        const brandName = workspace?.reseller?.brand_name || config.platform_name || "Grafty";
        const logoUrl = workspace?.reseller?.logo_url || config.logo_url || "https://grafty.pro/logo.png";
        
        // Sender Identity: Priority to Reseller SMTP Config -> System Config -> Default
        const fromEmail = rSmtp?.from_email || config.smtp_from_email || "no-reply@grafty.pro";
        const fromName = rSmtp?.from_name || workspace?.reseller?.brand_name || config.smtp_from_name || brandName;

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

        const transporter = await this.getTransporter(workspace?.reseller_id || undefined);
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
    /**
     * Send Payout Confirmation to Reseller
     */
    static async sendResellerPayoutEmail(resellerId: string, options: { 
        amount: number; 
        status: 'PAID' | 'FAILED' | 'REVERSED' | 'REJECTED'; 
        payoutId?: string; 
        reason?: string; 
    }) {
        const reseller = await prisma.reseller.findUnique({
            where: { id: resellerId }
        });

        if (!reseller || !reseller.email) return;

        const config = await SystemConfigService.getConfig();
        const brandName = config.platform_name || "Grafty";
        const logoUrl = config.logo_url || "https://grafty.pro/logo.png";
        const isSuccess = options.status === 'PAID';
        
        const amountStr = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(options.amount);
        
        const contentHtml = `
            <div style="text-align: center;">
                <div style="width: 80px; height: 80px; background: ${isSuccess ? '#ECFDF5' : '#FEF2F2'}; border-radius: 40px; display: inline-block; line-height: 80px; margin-bottom: 24px;">
                    <span style="font-size: 32px; vertical-align: middle;">${isSuccess ? '✅' : '❌'}</span>
                </div>
                <h1 style="color: #0F172A; font-size: 28px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.5px;">
                    ${isSuccess ? 'Settlement Disbursed' : 'Internal Alert'}
                </h1>
                <p style="color: #64748B; font-size: 16px; margin-bottom: 32px; line-height: 1.6;">
                    ${isSuccess 
                        ? `A settlement of <b style="color: #0F172A;">${amountStr}</b> has been successfully processed to your bank account.`
                        : `Your payout request of <b style="color: #0F172A;">${amountStr}</b> could not be completed at this time.`}
                </p>

                <table width="100%" cellpadding="0" cellspacing="0" style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 20px; padding: 24px; margin-bottom: 32px; text-align: left;">
                    <tr>
                        <td colspan="2" style="padding-bottom: 16px;">
                            <span style="font-size: 11px; color: #94A3B8; text-transform: uppercase; font-weight: 800; letter-spacing: 1.5px;">Transaction Details</span>
                        </td>
                    </tr>
                    <tr>
                        <td style="color: #64748B; font-size: 14px; padding: 8px 0;">Amount</td>
                        <td align="right" style="color: #0F172A; font-weight: 800; font-size: 14px; padding: 8px 0;">${amountStr}</td>
                    </tr>
                    ${options.payoutId ? `
                    <tr>
                        <td style="color: #64748B; font-size: 14px; padding: 8px 0;">Reference ID</td>
                        <td align="right" style="color: #0F172A; font-family: 'Courier New', Courier, monospace; font-weight: bold; font-size: 12px; padding: 8px 0;">${options.payoutId}</td>
                    </tr>` : ''}
                    <tr>
                        <td style="color: #64748B; font-size: 14px; padding: 8px 0;">Status</td>
                        <td align="right" style="color: ${isSuccess ? '#10B981' : '#EF4444'}; font-weight: 800; font-size: 13px; padding: 8px 0; text-transform: uppercase;">
                            ${options.status}
                        </td>
                    </tr>
                    ${!isSuccess && options.reason ? `
                    <tr>
                        <td colspan="2" style="margin-top: 16px; padding-top: 16px; border-top: 1px solid #E2E8F0;">
                            <p style="margin: 0; color: #EF4444; font-size: 13px; font-weight: bold;">
                                <span style="color: #94A3B8; font-weight: normal;">Reason:</span> ${options.reason}
                            </p>
                        </td>
                    </tr>` : ''}
                </table>

                <p style="color: #94A3B8; font-size: 13px; font-style: italic;">
                    ${isSuccess 
                        ? 'Funds may take some time to reflect in your bank account depending on IMPS/NEFT cycles.' 
                        : 'If this was unexpected, please check your bank details in the partner dashboard or contact support.'}
                </p>
            </div>
        `;

        const html = `
            <div style="background-color: #F1F5F9; padding: 40px 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                <div style="max-width: 600px; margin: auto; padding: 48px; border-radius: 32px; background: white; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);">
                    <div style="text-align: left; margin-bottom: 40px;">
                        <img src="${logoUrl}" alt="${brandName}" style="height: 32px;">
                    </div>
                    ${contentHtml}
                    <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #F1F5F9; text-align: center;">
                        <p style="font-size: 10px; color: #94A3B8; text-transform: uppercase; font-weight: 800; letter-spacing: 2px; margin: 0;">
                            SECURE FINANCIAL SETTLEMENT &middot; ${brandName.toUpperCase()} TREASURY
                        </p>
                    </div>
                </div>
                <div style="max-width: 600px; margin: 24px auto 0; text-align: center;">
                    <p style="font-size: 11px; color: #64748B;">
                        This is an automated notification. Please do not reply to this email.
                    </p>
                </div>
            </div>
        `;

        const transporter = await this.getTransporter();
        if (!transporter) return;

        try {
            await transporter.sendMail({
                from: `"${brandName} Treasury" <${process.env.SMTP_FROM_EMAIL || 'no-reply@grafty.pro'}>`,
                to: reseller.email,
                subject: `[${options.status}] Payout Confirmation - ${amountStr}`,
                html: html
            });
        } catch (e: any) {
            console.error("Failed to send payout confirmation email:", e.message);
        }
    }
}
