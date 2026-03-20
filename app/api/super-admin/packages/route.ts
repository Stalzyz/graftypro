
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

// Super Admin Only: List and Create Packages
export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        // Add check for admin role here if necessary, for now we rely on auth context

        const packages = await prisma.subscriptionPlan.findMany({
            where: {
                OR: [
                    { reseller_id: null },
                    { reseller_id: "" }
                ]
            },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json({ data: packages });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        const body = await req.json();

        const {
            name, description, monthly_price, original_monthly_price, yearly_price, original_yearly_price,
            currency, max_contacts, max_flows, max_campaigns, max_messages, max_teams,
            // Major Modules
            module_quick_replies, module_crm, module_ecommerce, module_academy, module_drip, module_integration,
            // Flow Nodes
            flow_msg_access, flow_automation_access, flow_logic_access, flow_commerce_access, flow_integration_access,
            // Legacy
            api_access, crm_access, flow_builder_access, drip_campaign_access, commerce_access, edu_engine_access,
            ai_fallback_enabled, abandoned_cart_recovery_enabled, is_public, credits, is_featured,
            min_reseller_monthly_price, min_reseller_yearly_price, hidden_plan, setup_fee, trial_days, features_list, bonus_text
        } = body;

        // Use monthly as price for legacy support
        const mPrice = parseFloat(monthly_price) || 0;
        const yPrice = parseFloat(yearly_price) || 0;

        const pkg = await prisma.subscriptionPlan.create({
            data: {
                name, description,
                price: mPrice, monthly_price: mPrice,
                original_monthly_price: parseFloat(original_monthly_price) || mPrice,
                yearly_price: yPrice,
                original_yearly_price: parseFloat(original_yearly_price) || yPrice,
                currency: currency || "INR",
                billing_cycle: "MONTHLY",
                max_contacts: parseInt(max_contacts) || 100,
                max_flows: parseInt(max_flows) || 3,
                max_campaigns: parseInt(max_campaigns) || -1,
                max_messages: parseInt(max_messages) || -1,
                max_teams: parseInt(max_teams) || 0,
                max_users: parseInt(body.max_users) || 1,
                // Major Modules
                module_quick_replies: !!module_quick_replies,
                module_crm: !!module_crm,
                module_ecommerce: !!module_ecommerce,
                module_academy: !!module_academy,
                module_drip: !!module_drip,
                module_integration: !!module_integration,
                // Flow Node Permissions (Synced with modules)
                flow_msg_access: module_quick_replies !== undefined ? !!module_quick_replies : (flow_msg_access !== undefined ? !!flow_msg_access : true),
                flow_automation_access: !!flow_automation_access,
                flow_logic_access: module_crm !== undefined ? !!module_crm : !!flow_logic_access,
                flow_commerce_access: module_ecommerce !== undefined ? !!module_ecommerce : !!flow_commerce_access,
                flow_integration_access: !!flow_integration_access,
                // Legacy (Synced with modules)
                api_access: !!api_access,
                crm_access: module_crm !== undefined ? !!module_crm : !!crm_access,
                flow_builder_access: !!flow_builder_access,
                drip_campaign_access: module_drip !== undefined ? !!module_drip : !!drip_campaign_access,
                commerce_access: module_ecommerce !== undefined ? !!module_ecommerce : !!commerce_access,
                edu_engine_access: module_academy !== undefined ? !!module_academy : !!edu_engine_access,
                ai_fallback_enabled: !!ai_fallback_enabled,
                abandoned_cart_recovery_enabled: !!abandoned_cart_recovery_enabled,
                is_public: is_public !== undefined ? !!is_public : true,
                is_active: body.is_active !== undefined ? !!body.is_active : true,
                credits: parseInt(credits) || 0,
                is_featured: !!is_featured,
                min_reseller_monthly_price: parseFloat(min_reseller_monthly_price) || 0,
                min_reseller_yearly_price: parseFloat(min_reseller_yearly_price) || 0,
                setup_fee: parseFloat(setup_fee) || 0,
                trial_days: parseInt(trial_days) || 0,
                hidden_plan: !!hidden_plan,
                features_list: Array.isArray(features_list) ? features_list : [],
                bonus_text: bonus_text || null,
                sort_order: parseInt(body.sort_order) || 0,
                cta_label: body.cta_label || "Get Started",
                badge_text: body.badge_text || "",
                accent_color: body.accent_color || "#27954D",
            }
        });

        return NextResponse.json({ data: pkg });
    } catch (error: any) {
        console.error("Create Package Error:", error);
        return NextResponse.json({ error: error.message || "Failed to create package" }, { status: 500 });
    }
}
