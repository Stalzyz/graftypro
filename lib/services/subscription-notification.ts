import { prisma } from "../db";
import { EmailService } from "../email/service";

export interface SubscriptionInfo {
    status: string;
    plan_name: string;
    subscription_ends_at: string;
    days_left: number;
    is_expiring_soon: boolean; // <= 7 days
    is_expired: boolean;
    is_paid_sub: boolean;
}

export class SubscriptionNotificationService {
    /**
     * Resolves exact subscription end date and remaining days for a workspace
     */
    static getSubscriptionInfo(workspace: any): SubscriptionInfo {
        const now = new Date();
        const planName = (workspace?.plan_details?.name || workspace?.plan || "FREE").toString().toUpperCase();
        const isFree = planName === "FREE";
        const isNegativeStatus = workspace?.subscription_status && 
            ["halted", "cancelled", "expired", "past_due", "inactive"].includes(workspace.subscription_status.toLowerCase());
        
        const isPaidSub = (!!workspace?.current_plan_id && !isFree) || (!isFree && !isNegativeStatus);

        let endsAt: Date;

        if (workspace?.subscription_ends_at) {
            endsAt = new Date(workspace.subscription_ends_at);
        } else if (workspace?.trial_ends_at) {
            endsAt = new Date(workspace.trial_ends_at);
        } else {
            // Project 30-day billing cycle from workspace creation / last update
            const baseDate = new Date(workspace?.created_at || now);
            endsAt = new Date(baseDate.getTime());
            while (endsAt.getTime() <= now.getTime()) {
                endsAt.setDate(endsAt.getDate() + 30);
            }
        }

        const diffMs = endsAt.getTime() - now.getTime();
        const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        const isExpired = endsAt.getTime() < now.getTime();
        const isExpiringSoon = daysLeft <= 7;

        return {
            status: isExpired ? "expired" : (isPaidSub ? "paid" : "trial"),
            plan_name: workspace?.plan_details?.name || workspace?.plan || "FREE",
            subscription_ends_at: endsAt.toISOString(),
            days_left: daysLeft,
            is_expiring_soon: isExpiringSoon,
            is_expired: isExpired,
            is_paid_sub: isPaidSub
        };
    }

    /**
     * Check single workspace and send email notification if within last 7 days
     */
    static async checkAndSendExpiryEmail(workspaceId: string): Promise<{ sent: boolean; reason?: string }> {
        try {
            const workspace = await prisma.workspace.findUnique({
                where: { id: workspaceId },
                include: {
                    plan_details: true,
                    users: {
                        select: { email: true, first_name: true, role: true }
                    }
                }
            });

            if (!workspace) return { sent: false, reason: "Workspace not found" };

            const subInfo = this.getSubscriptionInfo(workspace);

            // Only trigger notifications if within last 7 days
            if (!subInfo.is_expiring_soon && !subInfo.is_expired) {
                return { sent: false, reason: "Subscription has more than 7 days left" };
            }

            const todayStr = new Date().toISOString().split("T")[0];
            const settings = (workspace.settings as any) || {};

            // Prevent spamming — send max once per day
            if (settings.last_expiry_email_date === todayStr) {
                return { sent: false, reason: "Email notification already sent today" };
            }

            // Resolve target email (Workspace owner or first active user)
            const owner = workspace.users.find(u => u.role === "OWNER") || workspace.users[0];
            const recipientEmail = workspace.billing_email || owner?.email;

            if (!recipientEmail) {
                return { sent: false, reason: "No recipient email found for workspace" };
            }

            const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.grafty.pro";
            const formattedDate = new Date(subInfo.subscription_ends_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
            });

            const subject = subInfo.is_expired
                ? `🚨 CRITICAL: Your ${subInfo.plan_name} Subscription Has Expired`
                : `⚠️ Action Required: ${subInfo.days_left} Day${subInfo.days_left === 1 ? '' : 's'} Remaining on Your ${subInfo.plan_name} Subscription`;

            const bodyContent = `
                <div style="font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <span style="background-color: ${subInfo.is_expired ? '#fef2f2' : '#fffbeb'}; color: ${subInfo.is_expired ? '#dc2626' : '#d97706'}; font-size: 12px; font-weight: 800; padding: 6px 16px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px;">
                            ${subInfo.is_expired ? 'Subscription Expired' : `${subInfo.days_left} Days Remaining`}
                        </span>
                    </div>

                    <h2 style="font-size: 20px; font-weight: 800; color: #0f172a; margin-bottom: 12px; text-align: center;">
                        ${subInfo.is_expired 
                            ? `Your Workspace Access Needs Immediate Renewal` 
                            : `Your ${subInfo.plan_name} Subscription is Expiring Soon`}
                    </h2>

                    <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
                        Hello ${owner?.first_name || "Valued Customer"},
                    </p>

                    <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
                        ${subInfo.is_expired
                            ? `Your <strong>${subInfo.plan_name}</strong> plan for <strong>${workspace.name}</strong> has expired on <strong>${formattedDate}</strong>. To prevent interruption to your automated WhatsApp flows, broadcasts, and CRM access, please renew your subscription now.`
                            : `This is a reminder that your <strong>${subInfo.plan_name}</strong> subscription for <strong>${workspace.name}</strong> has <strong>${subInfo.days_left} day${subInfo.days_left === 1 ? '' : 's'} remaining</strong> and is set to expire on <strong>${formattedDate}</strong>.`
                        }
                    </p>

                    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; p: 16px; padding: 16px; margin-bottom: 24px;">
                        <table style="width: 100%; font-size: 13px;">
                            <tr>
                                <td style="color: #64748b; padding: 6px 0;">Workspace:</td>
                                <td style="font-weight: 700; color: #0f172a; text-align: right; padding: 6px 0;">${workspace.name}</td>
                            </tr>
                            <tr>
                                <td style="color: #64748b; padding: 6px 0;">Current Plan:</td>
                                <td style="font-weight: 700; color: #16a34a; text-align: right; padding: 6px 0;">${subInfo.plan_name}</td>
                            </tr>
                            <tr>
                                <td style="color: #64748b; padding: 6px 0;">Expiration Date:</td>
                                <td style="font-weight: 700; color: #0f172a; text-align: right; padding: 6px 0;">${formattedDate}</td>
                            </tr>
                            <tr>
                                <td style="color: #64748b; padding: 6px 0;">Days Left:</td>
                                <td style="font-weight: 700; color: ${subInfo.days_left <= 2 ? '#dc2626' : '#d97706'}; text-align: right; padding: 6px 0;">${subInfo.days_left} Days</td>
                            </tr>
                        </table>
                    </div>

                    <div style="text-align: center; margin-bottom: 24px;">
                        <a href="${appUrl}/dashboard/settings/billing" style="display: inline-block; background-color: #16a34a; color: #ffffff; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);">
                            Renew / Upgrade Subscription Now →
                        </a>
                    </div>

                    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
                        Need assistance or custom invoicing? Reply directly to this email or contact support.
                    </p>
                </div>
            `;

            const emailResult = await EmailService.sendBrandedEmail(workspaceId, {
                to: recipientEmail,
                subject,
                templateName: "SUBSCRIPTION_EXPIRY_WARNING",
                context: { body_content: bodyContent }
            });

            if (emailResult.success) {
                // Update workspace settings with email log
                await prisma.workspace.update({
                    where: { id: workspaceId },
                    data: {
                        settings: {
                            ...settings,
                            last_expiry_email_date: todayStr,
                            last_expiry_email_days_left: subInfo.days_left
                        }
                    }
                });
                return { sent: true };
            } else {
                return { sent: false, reason: emailResult.error || "Email delivery failed" };
            }
        } catch (err: any) {
            console.error(`[SubscriptionNotificationService] Error for workspace ${workspaceId}:`, err);
            return { sent: false, reason: err.message };
        }
    }

    /**
     * Batch process all workspaces expiring within 7 days
     */
    static async processAllExpiringWorkspaces(): Promise<{ processed: number; emailsSent: number }> {
        const workspaces = await prisma.workspace.findMany({
            select: { id: true, name: true, trial_ends_at: true, subscription_ends_at: true, subscription_status: true, plan: true, created_at: true }
        });

        let emailsSent = 0;
        let processed = 0;

        for (const ws of workspaces) {
            const info = this.getSubscriptionInfo(ws);
            if (info.is_expiring_soon || info.is_expired) {
                processed++;
                const res = await this.checkAndSendExpiryEmail(ws.id);
                if (res.sent) emailsSent++;
            }
        }

        return { processed, emailsSent };
    }
}
