import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getResellerSession } from "@/lib/reseller/auth-helper";

export const dynamic = "force-dynamic";

/**
 * GET /api/reseller/base-plans
 * Returns all public Super Admin plans available as base plans for resellers.
 * Resellers use this to price their own plans on top.
 */
export async function GET(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const basePlans = await prisma.subscriptionPlan.findMany({
            where: {
                is_public:    true,
                is_active:    true,
                hidden_plan:  false,
                reseller_id:  null,
            },
            orderBy: { monthly_price: "asc" },
            select: {
                id:                         true,
                name:                       true,
                description:                true,
                badge_text:                 true,
                cta_label:                  true,
                accent_color:               true,
                bonus_text:                 true,
                // Pricing
                monthly_price:              true,
                original_monthly_price:     true,
                yearly_price:               true,
                original_yearly_price:      true,
                currency:                   true,
                gst_percentage:             true,
                // Reseller base cost (minimum selling price enforced)
                min_reseller_monthly_price: true,
                min_reseller_yearly_price:  true,
                // Limits
                max_contacts:               true,
                max_messages:               true,
                max_flows:                  true,
                max_users:                  true,
                max_campaigns:              true,
                trial_days:                 true,
                // Modules
                module_crm:                 true,
                module_ecommerce:           true,
                module_academy:             true,
                module_integration:         true,
                module_drip:                true,
                // Flow Permissions
                flow_msg_access:            true,
                flow_automation_access:     true,
                flow_logic_access:          true,
                flow_commerce_access:       true,
                flow_integration_access:    true,
                // System Flags
                crm_access:                 true,
                api_access:                 true,
                flow_builder_access:        true,
                drip_campaign_access:       true,
                commerce_access:            true,
                edu_engine_access:          true,
                unlimited_messaging:        true,
                is_featured:                true,
                sort_order:                 true,
            },
        });

        return NextResponse.json({ data: basePlans });
    } catch (error: any) {
        console.error("[BASE_PLANS_GET]", error);
        return NextResponse.json({ error: "Failed to fetch base plans." }, { status: 500 });
    }
}
