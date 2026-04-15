import { prisma } from "@/lib/db";
import { CampaignStatus } from "@prisma/client";
import nodemailer from "nodemailer";
import { decrypt } from "@/lib/security/encryption";

/**
 * ⚡ BYOC Pulse: Bulk Email Engine (Vendor SMTP Node)
 * Handles full-lifecycle email campaigns through the vendor's own SMTP carrier.
 */

export class BulkEmailEngine {
    
    /**
     * Internal helper to dynamically generate an SMTP transporter for a specific workspace.
     */
    private static async getTransporter(workspaceId: string) {
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: { smtp_host: true, smtp_port: true, smtp_user: true, smtp_pass_enc: true, smtp_from_name: true, smtp_from_email: true, smtp_encryption: true, email_signature_html: true }
        });

        if (!workspace || !workspace.smtp_host || !workspace.smtp_user || !workspace.smtp_pass_enc) {
            throw new Error("SMTP credentials not configured for this workspace.");
        }

        const password = decrypt(workspace.smtp_pass_enc);
        const secure = workspace.smtp_encryption === "SSL" || workspace.smtp_port === 465;

        const transporter = nodemailer.createTransport({
            host: workspace.smtp_host,
            port: workspace.smtp_port || 587,
            secure: secure,
            auth: {
                user: workspace.smtp_user,
                pass: password
            }
        });

        const fromAddress = workspace.smtp_from_name 
            ? `"${workspace.smtp_from_name}" <${workspace.smtp_from_email || workspace.smtp_user}>` 
            : workspace.smtp_from_email || workspace.smtp_user;

        return { transporter, fromAddress, signature: workspace.email_signature_html || "" };
    }

    /**
     * Process a scheduled or triggered campaign
     */
    static async processCampaign(campaignId: string) {
        // 1. Fetch Campaign & Stats
        const campaign = await prisma.emailCampaign.findUnique({
            where: { id: campaignId },
            include: { stats: true, workspace: true }
        });

        if (!campaign || campaign.status === CampaignStatus.COMPLETED) return;

        // 2. Initialize Transporter First (Fail fast if no SMTP)
        let smtpContext;
        try {
            smtpContext = await this.getTransporter(campaign.workspace_id);
        } catch (error: any) {
            console.error(`🚨 [BULK-FATAL] ID: ${campaignId} - ${error.message}`);
            await prisma.emailCampaign.update({
                where: { id: campaignId },
                data: { status: CampaignStatus.FAILED }
            });
            return;
        }

        const { transporter, fromAddress, signature } = smtpContext;

        // 3. Refresh / Initialize Stats
        if (!campaign.stats) {
            await prisma.emailCampaignStats.create({
                data: { campaign_id: campaign.id }
            });
        }

        // 4. Update Status to PROCESSING
        await prisma.emailCampaign.update({
            where: { id: campaignId },
            data: { status: CampaignStatus.PROCESSING }
        });

        const filters = campaign.filters as any;
        
        // 5. Resolve Target Recipients (Contacts)
        const contacts = await prisma.contact.findMany({
            where: {
                workspace_id: campaign.workspace_id,
                email: { not: null },
                ...(filters.tags && { tags: { hasSome: filters.tags } }),
                NOT: {
                    workspace: {
                        unsubscribers: {
                            some: { email: { equals: "" /* Placeholder for dynamic check */ } }
                        }
                    }
                }
            }
        });

        // 6. Exclude Unsubscribers (Manual check)
        const unsubscribers = await prisma.emailUnsubscriber.findMany({
            where: { workspace_id: campaign.workspace_id },
            select: { email: true }
        });
        const unsubscribedEmails = new Set(unsubscribers.map(u => u.email.toLowerCase()));
        
        const recipients = contacts.filter(c => c.email && !unsubscribedEmails.has(c.email.toLowerCase()));

        // 7. Update Total Stats
        await prisma.emailCampaignStats.update({
            where: { campaign_id: campaignId },
            data: { total: recipients.length }
        });

        let sentCount = 0;
        let failCount = 0;

        // 8. Dispatching Loop
        for (const contact of recipients) {
            try {
                // Hydrate
                const body = campaign.html_content?.replace('{{first_name}}', contact.first_name || 'there') || '';
                const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe?email=${encodeURIComponent(contact.email!)}&workspace=${campaign.workspace_id}`;
                
                let combinedAttachmentsHtml = "";
                if (campaign.attachments && Array.isArray(campaign.attachments) && campaign.attachments.length > 0) {
                    combinedAttachmentsHtml = `<div style="margin-top: 30px; padding: 20px; background-color: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
                        <h4 style="margin: 0 0 15px 0; color: #334155; font-family: sans-serif; font-size: 14px;">Attached Documents</h4>
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${campaign.attachments.filter(a => a.name && a.url).map(att => `
                                <a href="${att.url}" target="_blank" style="display: inline-block; padding: 10px 16px; background-color: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; color: #0f172a; text-decoration: none; font-family: sans-serif; font-size: 13px; font-weight: bold; text-align: center;">
                                    📄 Download ${att.name}
                                </a>
                            `).join('')}
                        </div>
                    </div>`;
                }

                const finalHtml = `${body}
                ${combinedAttachmentsHtml}
                ${signature ? `<br/><br/><div class="grafty-signature">${signature}</div>` : ''}
                <br/><br/><div style="margin-top:20px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                    <a href="${unsubscribeUrl}" style="color: #94a3b8; font-size: 11px; text-decoration: none;">Unsubscribe from these emails</a>
                </div>`;

                await transporter.sendMail({
                    from: fromAddress as string,
                    to: contact.email!,
                    subject: campaign.subject,
                    html: finalHtml,
                    headers: { 'X-Campaign-ID': campaignId, 'X-Contact-ID': contact.id }
                });

                sentCount++;

                // Incremental status updates
                if (sentCount % 10 === 0) {
                    await prisma.emailCampaignStats.update({
                        where: { campaign_id: campaignId },
                        data: { sent: sentCount, failed: failCount }
                    });
                }
            } catch (err: any) {
                console.error(`❌ [EMAIL-FAIL] ${contact.email}:`, err.message || err);
                failCount++;
            }
        }

        // 9. Final Synchronization
        await prisma.emailCampaignStats.update({
            where: { campaign_id: campaignId },
            data: { sent: sentCount, failed: failCount }
        });

        await prisma.emailCampaign.update({
            where: { id: campaignId },
            data: { status: CampaignStatus.COMPLETED }
        });

        console.log(`✅ [CAMPAIGN-COMPLETE] ID: ${campaignId} | Sent: ${sentCount} | Failed: ${failCount}`);
    }

    /**
     * Trigger a single automated email (Welcome, Abandoned Cart, etc.)
     */
    static async sendSingleEmail(payload: {
        workspaceId: string;
        to: string;
        subject: string;
        html: string;
        tags?: { name: string; value: string }[];
    }) {
        const { workspaceId, to, subject, html } = payload;

        // Check suppression
        const isUnsubscribed = await prisma.emailUnsubscriber.findUnique({
            where: { workspace_id_email: { workspace_id: workspaceId, email: to.toLowerCase() } }
        });

        if (isUnsubscribed) {
            console.log(`🚫 [AUTO-SUPPRESSED] ${to} has opted out.`);
            return { success: false, reason: "UNSUBSCRIBED" };
        }

        try {
            const { transporter, fromAddress, signature } = await this.getTransporter(workspaceId);

            const finalHtml = `${html}
            ${signature ? `<br/><br/><div class="grafty-signature">${signature}</div>` : ''}`;

            const info = await transporter.sendMail({
                from: fromAddress as string,
                to,
                subject,
                html: finalHtml
            });

            return { success: true, data: info };
        } catch (error: any) {
            console.error(`❌ [AUTO-FAIL] ${to}:`, error.message || error);
            return { success: false, error: error.message };
        }
    }
}
