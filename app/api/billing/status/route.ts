
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

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
        // The legacy `workspace.plan` enum (FREE/PRO/ENTERPRISE) is NOT the source of truth.
        // `plan_details` is the actual linked SubscriptionPlan record.
        // @ts-ignore
        const details = workspace?.plan_details || null;

        // Determine if this is a genuinely active paid subscription
        // 'created' = payment initiated but not completed, should NOT be treated as active
        const ACTIVE_STATUSES = ['active', 'authenticated'];
        const isReallyActive = ACTIVE_STATUSES.includes((workspace?.subscription_status || '').toLowerCase());

        // The plan name to show — if truly active, use plan_details.name; otherwise show FREE
        const resolvedPlanName = (isReallyActive && details?.name) ? details.name : "FREE";

        return NextResponse.json(
            {
                plan: resolvedPlanName,
                status: workspace?.subscription_status,
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
