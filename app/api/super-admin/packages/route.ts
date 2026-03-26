import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

function validatePackage(body: any) {
    const errors: string[] = [];
    const data = {
        // General
        name:               String(body.name || "").trim(),
        description:        String(body.description || "").trim(),
        badge_text:         String(body.badge_text || "").trim(),
        cta_label:          String(body.cta_label || "Get Started").trim(),
        accent_color:       String(body.accent_color || "#27954D").trim(),
        bonus_text:         String(body.bonus_text || "").trim(),
        // Pricing
        monthly_price:               Number(body.monthly_price ?? 0),
        original_monthly_price:      Number(body.original_monthly_price ?? 0),
        yearly_price:                Number(body.yearly_price ?? 0),
        original_yearly_price:       Number(body.original_yearly_price ?? 0),
        currency:                    String(body.currency || "INR"),
        gst_percentage:              Number(body.gst_percentage ?? 18),
        setup_fee:                   Number(body.setup_fee ?? 0),
        // Reseller Costs
        min_reseller_monthly_price:  Number(body.min_reseller_monthly_price ?? 0),
        min_reseller_yearly_price:   Number(body.min_reseller_yearly_price ?? 0),
        // Limits
        max_contacts:   Number(body.max_contacts ?? 100),
        max_messages:   Number(body.max_messages ?? 500),
        max_flows:      Number(body.max_flows ?? 3),
        max_users:      Number(body.max_users ?? 1),   // agents
        max_campaigns:  Number(body.max_campaigns ?? 1),
        trial_days:     Number(body.trial_days ?? 0),
        // Modules
        module_crm:           Boolean(body.module_crm),
        module_ecommerce:     Boolean(body.module_ecommerce),
        module_academy:       Boolean(body.module_academy),
        module_integration:   Boolean(body.module_integration),
        module_drip:          Boolean(body.module_drip),
        // Flow Nodes
        flow_msg_access:          Boolean(body.flow_msg_access ?? true),
        flow_automation_access:   Boolean(body.flow_automation_access),
        flow_logic_access:        Boolean(body.flow_logic_access),
        flow_commerce_access:     Boolean(body.flow_commerce_access),
        flow_integration_access:  Boolean(body.flow_integration_access),
        // Feature Flags
        is_featured:          Boolean(body.is_featured),
        hidden_plan:          Boolean(body.hidden_plan),
        unlimited_messaging:  Boolean(body.unlimited_messaging),
        is_managed:           Boolean(body.is_managed ?? true),
        ai_fallback_enabled:  Boolean(body.ai_fallback_enabled),
        abandoned_cart_recovery_enabled: Boolean(body.abandoned_cart_recovery_enabled),
        // Custom Bullet List
        features_list:        Array.isArray(body.features_list) ? body.features_list : [],
        // Razorpay IDs
        razorpay_monthly_plan_id: String(body.razorpay_monthly_plan_id || "").trim(),
        razorpay_yearly_plan_id:  String(body.razorpay_yearly_plan_id || "").trim(),
    };

    if (data.name.length < 2)    errors.push("Package name must be at least 2 characters.");
    if (data.monthly_price < 0)  errors.push("Monthly price cannot be negative.");
    if (data.yearly_price < 0)   errors.push("Yearly price cannot be negative.");
    if (data.gst_percentage < 0) errors.push("GST cannot be negative.");

    return { isValid: errors.length === 0, errors, data };
}

export async function GET(req: NextRequest) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const packages = await prisma.subscriptionPlan.findMany({
            where: { OR: [{ reseller_id: null }, { reseller_id: "" }] },
            orderBy: { sort_order: "asc" },
        });

        return NextResponse.json({ data: packages });
    } catch (error: any) {
        console.error("[PACKAGES_GET]", error);
        return NextResponse.json({ error: "Failed to fetch packages." }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { isValid, errors, data } = validatePackage(body);

        if (!isValid) {
            return NextResponse.json({ error: "Validation failed", details: errors }, { status: 400 });
        }

        const plan = await prisma.subscriptionPlan.create({
            data: {
                ...data,
                reseller_id: null,
                // Legacy flag sync
                crm_access:          data.module_crm,
                flow_logic_access:   data.flow_logic_access,
                commerce_access:     data.module_ecommerce,
                flow_commerce_access: data.flow_commerce_access,
                edu_engine_access:   data.module_academy,
                api_access:          data.module_integration,
                drip_campaign_access: data.module_drip,
                flow_builder_access: true,
                is_public:  true,
                sort_order: 0,
            },
        });

        return NextResponse.json(plan, { status: 201 });
    } catch (error: any) {
        console.error("[PACKAGES_POST]", error);
        return NextResponse.json({ error: "Failed to create package." }, { status: 500 });
    }
}
