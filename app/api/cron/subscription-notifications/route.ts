import { NextResponse } from "next/server";
import { SubscriptionNotificationService } from "@/lib/services/subscription-notification";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { processed, emailsSent } = await SubscriptionNotificationService.processAllExpiringWorkspaces();
        return NextResponse.json({
            status: "success",
            processed_workspaces: processed,
            emails_sent: emailsSent,
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        console.error("❌ [CRON_SUBSCRIPTION_EXPIRY_ERR]:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    return GET(req);
}
