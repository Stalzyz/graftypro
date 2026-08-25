
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

import { SubscriptionNotificationService } from "../../../../lib/services/subscription-notification";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const workspace = await (prisma.workspace as any).findUnique({
            where: { id: user.workspaceId },
            include: { plan_details: true }
        });

        // ✅ FIX: Use plan_details.name as the canonical plan name.
        // @ts-ignore
        const details = workspace?.plan_details || null;

        const ACTIVE_STATUSES = ['active', 'authenticated'];
        const isReallyActive = ACTIVE_STATUSES.includes((workspace?.subscription_status || '').toLowerCase());
        const resolvedPlanName = (isReallyActive && details?.name) ? details.name : "FREE";

        // Calculate subscription expiration details & remaining days
        const subInfo = SubscriptionNotificationService.getSubscriptionInfo(workspace);

        // Async trigger expiry email notification if within last 7 days (non-blocking)
        if (subInfo.is_expiring_soon || subInfo.is_expired) {
            SubscriptionNotificationService.checkAndSendExpiryEmail(user.workspaceId).catch(err => {
                console.error("[BILLING_STATUS] Async email notification error:", err);
            });
        }

        return NextResponse.json(
            {
                plan: resolvedPlanName,
                status: workspace?.subscription_status,
                days_left: subInfo.days_left,
                subscription_ends_at: subInfo.subscription_ends_at,
                is_expiring_soon: subInfo.is_expiring_soon,
                is_expired: subInfo.is_expired,
                details: details || {
                    name: "FREE",
                    max_contacts: 100,
                    max_flows: 3,
                    max_campaigns: 1,
                    max_messages: 500,
                    crm_access: false,
                    api_access: false,
                    flow_builder_access: true,
                    drip_campaign_access: false,
                }
            },
            {
                headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                }
            }
        );

    } catch (error) {
        return NextResponse.json({ error: "Error fetching status" }, { status: 500 });
    }
}
