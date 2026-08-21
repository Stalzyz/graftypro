import { prisma } from "../db";
import { EmailService } from "./service";

/**
 * 🚀 Grafty Sales & Activation Engine
 * Automated retention, drop-off recovery, and sales-boosting email sequences.
 */
export class SalesAutomationEngine {

    /**
     * 1️⃣ WABA SETUP DROPOFF EMAIL (24 Hours after Signup)
     * Target: Users signed up >24h ago without WABA connected
     */
    static async sendWabaSetupDropoffEmail(user: { id: string; email: string; first_name?: string | null; workspace_id: string }) {
        const name = user.first_name || user.email.split('@')[0];
        
        await EmailService.sendBrandedEmail(user.workspace_id, {
            to: user.email,
            subject: "🚀 Complete your 2-minute WhatsApp setup (You're almost there!)",
            templateName: "WABA_SETUP_DROPOFF",
            context: {
                body_content: `
                    <div style="text-align: center;">
                        <div style="width: 64px; height: 64px; background: #ECFDF5; border-radius: 32px; display: inline-block; line-height: 64px; margin-bottom: 20px;">
                            <span style="font-size: 28px;">📲</span>
                        </div>
                        <h1 style="color: #0F172A; font-size: 24px; font-weight: 800; margin-bottom: 12px;">You're 1 Step Away from Launching on WhatsApp</h1>
                        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                            Hi <b>${name}</b>, we noticed you created your Grafty account but haven't linked your WhatsApp Business number yet.
                        </p>
                        
                        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 20px; padding: 24px; text-align: left; margin-bottom: 24px; font-size: 14px; color: #334155;">
                            <b style="color: #0F172A;">What you unlock upon setup:</b>
                            <ul style="margin: 12px 0 0 0; padding-left: 20px; line-height: 1.8;">
                                <li>✨ <b>1,000 Free Monthly Service Conversations</b> from Meta</li>
                                <li>⚡ <b>98% Open Rate</b> compared to traditional SMS</li>
                                <li>🛒 <b>1-Click Catalog & Checkout</b> inside WhatsApp</li>
                            </ul>
                        </div>

                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/preferences" style="background-color: #27954D; color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block; box-shadow: 0 4px 6px rgba(39, 149, 77, 0.2);">Connect WhatsApp Account Now →</a>
                    </div>
                `
            }
        });
    }

    /**
     * 2️⃣ TEMPLATE CREATOR NUDGE (3 Days after Signup)
     * Target: WABA connected, but 0 templates created
     */
    static async sendTemplateNudgeEmail(user: { id: string; email: string; first_name?: string | null; workspace_id: string }) {
        const name = user.first_name || user.email.split('@')[0];

        await EmailService.sendBrandedEmail(user.workspace_id, {
            to: user.email,
            subject: "🎁 Claim 5 Ready-to-Use WhatsApp Templates for Your Store",
            templateName: "TEMPLATE_CREATOR_NUDGE",
            context: {
                body_content: `
                    <div style="text-align: center;">
                        <div style="width: 64px; height: 64px; background: #FEF3C7; border-radius: 32px; display: inline-block; line-height: 64px; margin-bottom: 20px;">
                            <span style="font-size: 28px;">🎁</span>
                        </div>
                        <h1 style="color: #0F172A; font-size: 24px; font-weight: 800; margin-bottom: 12px;">Start Sending Messages in Seconds</h1>
                        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                            Hi <b>${name}</b>, writing Meta-compliant templates from scratch can take time. We've unlocked 5 pre-approved e-commerce templates in your dashboard.
                        </p>

                        <div style="background: #FFFBEB; border: 1px solid #FCD34D; border-radius: 20px; padding: 24px; text-align: left; margin-bottom: 24px; font-size: 13px; color: #78350F;">
                            <b>Pre-Approved Templates Ready to Copy:</b>
                            <ul style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.8;">
                                <li>🛍️ Abandoned Cart Reminder with Discount</li>
                                <li>📦 Order Confirmation & Tracking</li>
                                <li>🔥 VIP Exclusive Discount Broadcast</li>
                                <li>🔑 Verification OTP Code</li>
                            </ul>
                        </div>

                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/templates" style="background-color: #D97706; color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">Use Pre-Approved Templates →</a>
                    </div>
                `
            }
        });
    }

    /**
     * 3️⃣ SHOPIFY / INTEGRATION DROPOFF NUDGE (5 Days after Signup)
     * Target: Has workspace, but 0 integrations connected
     */
    static async sendShopifyNudgeEmail(user: { id: string; email: string; first_name?: string | null; workspace_id: string }) {
        const name = user.first_name || user.email.split('@')[0];

        await EmailService.sendBrandedEmail(user.workspace_id, {
            to: user.email,
            subject: "💰 Recover up to 35% of abandoned carts automatically",
            templateName: "SHOPIFY_NUDGE",
            context: {
                body_content: `
                    <div style="text-align: center;">
                        <div style="width: 64px; height: 64px; background: #EFF6FF; border-radius: 32px; display: inline-block; line-height: 64px; margin-bottom: 20px;">
                            <span style="font-size: 28px;">🛒</span>
                        </div>
                        <h1 style="color: #0F172A; font-size: 24px; font-weight: 800; margin-bottom: 12px;">Turn Lost Shoppers Into Repeat Customers</h1>
                        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                            Hi <b>${name}</b>, did you know that 70% of online shoppers add items to their cart and leave without purchasing?
                        </p>

                        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
                            With Grafty's 1-click store integration, your store sends an automated WhatsApp message 15 minutes after a cart is abandoned.
                        </p>

                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/crm" style="background-color: #2563EB; color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">Connect Store & Enable Recovery →</a>
                    </div>
                `
            }
        });
    }

    /**
     * 4️⃣ INACTIVITY RE-ENGAGEMENT NUDGE (14 Days of Inactivity)
     * Target: Users with no active campaigns in 14 days
     */
    static async sendInactivityNudgeEmail(user: { id: string; email: string; first_name?: string | null; workspace_id: string }) {
        const name = user.first_name || user.email.split('@')[0];

        await EmailService.sendBrandedEmail(user.workspace_id, {
            to: user.email,
            subject: "💡 3 WhatsApp Broadcast Ideas to Boost Your Sales This Weekend",
            templateName: "INACTIVITY_NUDGE",
            context: {
                body_content: `
                    <div>
                        <h1 style="color: #0F172A; font-size: 22px; font-weight: 800; margin-bottom: 12px;">We Miss You, ${name}! 👋</h1>
                        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                            It's been 14 days since your last WhatsApp campaign. Here are 3 quick high-ROI campaign ideas you can launch in under 5 minutes:
                        </p>

                        <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 16px; padding: 20px; margin-bottom: 24px; font-size: 13px; color: #334155;">
                            <p style="margin: 0 0 8px 0;"><b>1. VIP Loyalty Sale:</b> Send a 10% discount code to your top 100 contacts.</p>
                            <p style="margin: 0 0 8px 0;"><b>2. Back-In-Stock Alert:</b> Re-engage customers who missed out on popular items.</p>
                            <p style="margin: 0;"><b>3. Flash 24-Hour Deal:</b> Create urgency with a limited-time coupon blast.</p>
                        </div>

                        <div style="text-align: center;">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/campaigns" style="background-color: #27954D; color: white; padding: 14px 28px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 14px; display: inline-block;">Launch Weekend Broadcast →</a>
                        </div>
                    </div>
                `
            }
        });
    }

    /**
     * 5️⃣ HIGH USAGE UPGRADE NUDGE (>5,000 messages sent)
     */
    static async sendHighUsageUpgradeNudge(workspaceId: string, toEmail: string, totalSent: number) {
        await EmailService.sendBrandedEmail(workspaceId, {
            to: toEmail,
            subject: `🎉 You just hit ${totalSent.toLocaleString()} WhatsApp broadcasts on Grafty!`,
            templateName: "HIGH_USAGE_UPGRADE",
            context: {
                body_content: `
                    <div style="text-align: center;">
                        <div style="font-size: 48px; margin-bottom: 16px;">🚀</div>
                        <h1 style="color: #0F172A; font-size: 24px; font-weight: 800; margin-bottom: 12px;">Milestone Reached: ${totalSent.toLocaleString()} Messages</h1>
                        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin-bottom: 24px;">
                            Your store is growing fast! Upgrade to the <b>Growth Plan</b> to unlock 10x faster sending speeds (80 msgs/sec), AI chatbot auto-replies, and unlimited agent seats.
                        </p>
                        <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing" style="background-color: #2563EB; color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: bold; font-size: 15px; display: inline-block;">Upgrade Plan & Get 20% Off →</a>
                    </div>
                `
            }
        });
    }

    /**
     * 🛰️ AUTONOMOUS ACTIVATION & RETENTION SWEEPER
     * Runs periodically to inspect user activation stages and trigger email nudges.
     */
    static async runActivationAndDropoffSweeper() {
        console.log("🚀 [SalesAutomation] Running Activation & Drop-off Retention Sweeper...");
        try {
            const now = Date.now();
            const ONE_DAY_AGO = new Date(now - 24 * 60 * 60 * 1000);
            const TWO_DAYS_AGO = new Date(now - 48 * 60 * 60 * 1000);
            const THREE_DAYS_AGO = new Date(now - 3 * 24 * 60 * 60 * 1000);
            const FOUR_DAYS_AGO = new Date(now - 4 * 24 * 60 * 60 * 1000);
            const FIVE_DAYS_AGO = new Date(now - 5 * 24 * 60 * 60 * 1000);
            const SIX_DAYS_AGO = new Date(now - 6 * 24 * 60 * 60 * 1000);
            const FOURTEEN_DAYS_AGO = new Date(now - 14 * 24 * 60 * 60 * 1000);

            // 1. WABA Setup Dropoff (Signed up between 24h and 48h ago without WABA)
            const wabaDropoffs = await prisma.user.findMany({
                where: {
                    created_at: { gte: TWO_DAYS_AGO, lte: ONE_DAY_AGO },
                    workspace: { waba: null }
                },
                select: { id: true, email: true, first_name: true, workspace_id: true }
            });

            for (const u of wabaDropoffs) {
                await this.sendWabaSetupDropoffEmail(u).catch(e => console.error("WABA dropoff email error:", e.message));
            }

            // 2. Template Nudge (WABA connected, signed up between 3d and 4d ago, 0 templates)
            const templateDropoffs = await prisma.user.findMany({
                where: {
                    created_at: { gte: FOUR_DAYS_AGO, lte: THREE_DAYS_AGO },
                    workspace: { waba: { isNot: null }, templates: { none: {} } }
                },
                select: { id: true, email: true, first_name: true, workspace_id: true }
            });

            for (const u of templateDropoffs) {
                await this.sendTemplateNudgeEmail(u).catch(e => console.error("Template nudge email error:", e.message));
            }

            // 3. Shopify Nudge (Signed up between 5d and 6d ago, 0 ecommerce integrations)
            const shopifyDropoffs = await prisma.user.findMany({
                where: {
                    created_at: { gte: SIX_DAYS_AGO, lte: FIVE_DAYS_AGO },
                    workspace: { commerce_orders: { none: {} } }
                },
                select: { id: true, email: true, first_name: true, workspace_id: true }
            });

            for (const u of shopifyDropoffs) {
                await this.sendShopifyNudgeEmail(u).catch(e => console.error("Shopify nudge email error:", e.message));
            }

            console.log(`✅ [SalesAutomation] Sweeper Finished: Processed ${wabaDropoffs.length} WABA, ${templateDropoffs.length} Template, ${shopifyDropoffs.length} Integration nudges.`);
        } catch (error: any) {
            console.error("❌ [SalesAutomation] Sweeper Error:", error.message);
        }
    }
}
