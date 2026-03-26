import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

function validatePatch(body: any) {
    const data: any = {};
    const str  = (v: any) => String(v).trim();
    const num  = (v: any) => Number(v);
    const bool = (v: any) => Boolean(v);

    // General
    if (body.name !== undefined)        data.name        = str(body.name);
    if (body.description !== undefined) data.description = str(body.description);
    if (body.badge_text !== undefined)  data.badge_text  = str(body.badge_text);
    if (body.cta_label !== undefined)   data.cta_label   = str(body.cta_label);
    if (body.accent_color !== undefined) data.accent_color = str(body.accent_color);
    if (body.bonus_text !== undefined)  data.bonus_text  = str(body.bonus_text);
    // Pricing
    if (body.monthly_price !== undefined)          data.monthly_price          = num(body.monthly_price);
    if (body.original_monthly_price !== undefined) data.original_monthly_price = num(body.original_monthly_price);
    if (body.yearly_price !== undefined)           data.yearly_price           = num(body.yearly_price);
    if (body.original_yearly_price !== undefined)  data.original_yearly_price  = num(body.original_yearly_price);
    if (body.currency !== undefined)               data.currency               = str(body.currency);
    if (body.gst_percentage !== undefined)         data.gst_percentage         = num(body.gst_percentage);
    if (body.setup_fee !== undefined)              data.setup_fee              = num(body.setup_fee);
    // Reseller Costs
    if (body.min_reseller_monthly_price !== undefined) data.min_reseller_monthly_price = num(body.min_reseller_monthly_price);
    if (body.min_reseller_yearly_price !== undefined)  data.min_reseller_yearly_price  = num(body.min_reseller_yearly_price);
    // Limits
    if (body.max_contacts !== undefined)  data.max_contacts  = num(body.max_contacts);
    if (body.max_messages !== undefined)  data.max_messages  = num(body.max_messages);
    if (body.max_flows !== undefined)     data.max_flows     = num(body.max_flows);
    if (body.max_users !== undefined)     data.max_users     = num(body.max_users);
    if (body.max_campaigns !== undefined) data.max_campaigns = num(body.max_campaigns);
    if (body.trial_days !== undefined)    data.trial_days    = num(body.trial_days);
    // Modules
    if (body.module_crm !== undefined) {
        data.module_crm  = bool(body.module_crm);
        data.crm_access  = bool(body.module_crm);
    }
    if (body.module_ecommerce !== undefined) {
        data.module_ecommerce = bool(body.module_ecommerce);
        data.commerce_access  = bool(body.module_ecommerce);
    }
    if (body.module_academy !== undefined) {
        data.module_academy   = bool(body.module_academy);
        data.edu_engine_access = bool(body.module_academy);
    }
    if (body.module_integration !== undefined) {
        data.module_integration = bool(body.module_integration);
        data.api_access         = bool(body.module_integration);
    }
    if (body.module_drip !== undefined) {
        data.module_drip          = bool(body.module_drip);
        data.drip_campaign_access = bool(body.module_drip);
    }
    // Flow Nodes
    if (body.flow_msg_access !== undefined)         data.flow_msg_access         = bool(body.flow_msg_access);
    if (body.flow_automation_access !== undefined)  data.flow_automation_access  = bool(body.flow_automation_access);
    if (body.flow_logic_access !== undefined)       data.flow_logic_access       = bool(body.flow_logic_access);
    if (body.flow_commerce_access !== undefined)    data.flow_commerce_access    = bool(body.flow_commerce_access);
    if (body.flow_integration_access !== undefined) data.flow_integration_access = bool(body.flow_integration_access);
    // Feature Flags
    if (body.is_featured !== undefined)         data.is_featured         = bool(body.is_featured);
    if (body.hidden_plan !== undefined)         data.hidden_plan         = bool(body.hidden_plan);
    if (body.unlimited_messaging !== undefined) data.unlimited_messaging = bool(body.unlimited_messaging);

    // Razorpay
    if (body.razorpay_monthly_plan_id !== undefined) data.razorpay_monthly_plan_id = str(body.razorpay_monthly_plan_id);
    if (body.razorpay_yearly_plan_id !== undefined)  data.razorpay_yearly_plan_id  = str(body.razorpay_yearly_plan_id);
    
    // Custom Bullet List
    if (body.features_list !== undefined) {
        data.features_list = Array.isArray(body.features_list) ? body.features_list : [];
    }

    return data;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const data = validatePatch(body);

        if (Object.keys(data).length === 0) {
            return NextResponse.json({ error: "No fields to update." }, { status: 400 });
        }

        const pkg = await prisma.subscriptionPlan.update({ where: { id: params.id }, data });
        return NextResponse.json({ data: pkg });
    } catch (error: any) {
        console.error("[PACKAGES_PATCH]", error);
        return NextResponse.json({ error: "Failed to update package." }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const usageCount = await prisma.workspace.count({ where: { current_plan_id: params.id } });
        if (usageCount > 0) {
            return NextResponse.json(
                { error: `Cannot delete: ${usageCount} active workspace(s) are on this package.` },
                { status: 400 }
            );
        }

        await prisma.subscriptionPlan.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("[PACKAGES_DELETE]", error);
        return NextResponse.json({ error: "Failed to delete package." }, { status: 500 });
    }
}
