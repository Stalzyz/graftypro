import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getResellerSession } from "../../../../lib/reseller/auth-helper";

export const dynamic = "force-dynamic";

/**
 * GET /api/reseller/base-plans
 * Returns all public Super Admin plans that are eligible as base engines
 * for partner custom retail plans (W2R mapping).
 * Uses reseller session auth so partners can access this.
 */
export async function GET(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const basePlans = await prisma.subscriptionPlan.findMany({
            where: {
                is_public: true,
                reseller_id: null  // Only global base plans (not partner-created ones)
            },
            orderBy: { monthly_price: "asc" },
            select: {
                id: true,
                name: true,
                description: true,
                monthly_price: true,
                yearly_price: true,
                max_contacts: true,
                max_flows: true,
                max_users: true,
                max_messages: true,
                api_access: true,
                crm_access: true,
                flow_builder_access: true,
                drip_campaign_access: true,
                commerce_access: true,
                edu_engine_access: true,
                is_featured: true,
                min_reseller_price: true
            }
        });

        return NextResponse.json({ data: basePlans });

    } catch (error) {
        console.error("Base Plans Fetch Error:", error);
        return NextResponse.json({ error: "Failed to fetch base plans" }, { status: 500 });
    }
}
