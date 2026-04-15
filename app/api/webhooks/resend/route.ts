export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * 🛰️ Grafty Signal Hub: Resend Webhook Listener
 * Receives real-time engagement events (Opens, Clicks, Bounces)
 * and updates campaign statistics in the dashboard HUD.
 * 
 * Secure Endpoint: Should be verified with Resend signature headers in production.
 */

export async function POST(req: Request) {
    try {
        const payload = await req.json();
        const { type, data } = payload;

        // Resend includes custom tags in the webhook payload
        const campaignId = data.tags?.campaign_id;
        
        if (!campaignId) {
            return NextResponse.json({ received: true, note: "No campaign context" });
        }

        switch (type) {
            case 'email.delivered':
                await prisma.emailCampaignStats.update({
                    where: { campaign_id: campaignId },
                    data: { delivered: { increment: 1 } }
                });
                break;

            case 'email.opened':
                await prisma.emailCampaignStats.update({
                    where: { campaign_id: campaignId },
                    data: { opened: { increment: 1 } }
                });
                break;

            case 'email.clicked':
                await prisma.emailCampaignStats.update({
                    where: { campaign_id: campaignId },
                    data: { clicked: { increment: 1 } }
                });
                break;

            case 'email.bounced':
                await prisma.emailCampaignStats.update({
                    where: { campaign_id: campaignId },
                    data: { failed: { increment: 1 } }
                });
                break;
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("🚨 [RESEND-WEBHOOK-ERROR]:", error);
        return NextResponse.json({ error: "Internal Protocol Failure" }, { status: 500 });
    }
}
