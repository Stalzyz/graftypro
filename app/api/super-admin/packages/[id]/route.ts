
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCurrentUser } from "../../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        const { id } = params;

        const data: any = {};
        if (body.name) data.name = body.name;
        if (body.description) data.description = body.description;
        if (body.currency) data.currency = body.currency;

        if (body.monthly_price !== undefined) {
            const mPrice = parseFloat(body.monthly_price) || 0;
            data.monthly_price = mPrice;
            data.price = mPrice; // sync legacy
        }
        if (body.original_monthly_price !== undefined) {
            data.original_monthly_price = parseFloat(body.original_monthly_price) || 0;
        }
        if (body.yearly_price !== undefined) {
            data.yearly_price = parseFloat(body.yearly_price) || 0;
        }
        if (body.original_yearly_price !== undefined) {
            data.original_yearly_price = parseFloat(body.original_yearly_price) || 0;
        }
        if (body.min_reseller_monthly_price !== undefined) {
            data.min_reseller_monthly_price = parseFloat(body.min_reseller_monthly_price) || 0;
        }
        if (body.min_reseller_yearly_price !== undefined) {
            data.min_reseller_yearly_price = parseFloat(body.min_reseller_yearly_price) || 0;
        }
        if (body.setup_fee !== undefined) {
            data.setup_fee = parseFloat(body.setup_fee) || 0;
        }
        if (body.trial_days !== undefined) {
            data.trial_days = parseInt(body.trial_days) || 0;
        }
        if (body.hidden_plan !== undefined) {
            data.hidden_plan = !!body.hidden_plan;
        }
        if (body.max_teams !== undefined) data.max_teams = parseInt(body.max_teams);
        if (body.cta_label !== undefined) data.cta_label = body.cta_label || "Get Started";
        if (body.badge_text !== undefined) data.badge_text = body.badge_text;
        if (body.accent_color !== undefined) data.accent_color = body.accent_color || "#27954D";
        if (body.sort_order !== undefined) data.sort_order = parseInt(body.sort_order) || 0;
        if (body.bonus_text !== undefined) data.bonus_text = body.bonus_text || null;
        if (body.features_list !== undefined) {
            data.features_list = Array.isArray(body.features_list) ? body.features_list : [];
        }

        // Limits
        if (body.max_contacts !== undefined) data.max_contacts = parseInt(body.max_contacts);
        if (body.max_flows !== undefined) data.max_flows = parseInt(body.max_flows);
        if (body.max_campaigns !== undefined) data.max_campaigns = parseInt(body.max_campaigns);
        if (body.max_messages !== undefined) data.max_messages = parseInt(body.max_messages);

        // Legacy Access
        if (body.api_access !== undefined) data.api_access = !!body.api_access;
        if (body.crm_access !== undefined) data.crm_access = !!body.crm_access;
        if (body.flow_builder_access !== undefined) data.flow_builder_access = !!body.flow_builder_access;
        if (body.drip_campaign_access !== undefined) data.drip_campaign_access = !!body.drip_campaign_access;
        if (body.commerce_access !== undefined) data.commerce_access = !!body.commerce_access;
        if (body.edu_engine_access !== undefined) data.edu_engine_access = !!body.edu_engine_access;
        if (body.ai_fallback_enabled !== undefined) data.ai_fallback_enabled = !!body.ai_fallback_enabled;
        if (body.abandoned_cart_recovery_enabled !== undefined) data.abandoned_cart_recovery_enabled = !!body.abandoned_cart_recovery_enabled;
        if (body.is_public !== undefined) data.is_public = !!body.is_public;
        if (body.is_active !== undefined) data.is_active = !!body.is_active;
        if (body.credits !== undefined) data.credits = parseInt(body.credits) || 0;
        if (body.is_featured !== undefined) data.is_featured = !!body.is_featured;
        if (body.module_quick_replies !== undefined) { data.module_quick_replies = !!body.module_quick_replies; data.flow_msg_access = !!body.module_quick_replies; }
        if (body.module_crm !== undefined) { data.module_crm = !!body.module_crm; data.crm_access = !!body.module_crm; data.flow_logic_access = !!body.module_crm; }
        if (body.module_ecommerce !== undefined) { data.module_ecommerce = !!body.module_ecommerce; data.commerce_access = !!body.module_ecommerce; data.flow_commerce_access = !!body.module_ecommerce; }
        if (body.module_academy !== undefined) { data.module_academy = !!body.module_academy; data.edu_engine_access = !!body.module_academy; }
        if (body.module_drip !== undefined) { data.module_drip = !!body.module_drip; data.drip_campaign_access = !!body.module_drip; }
        if (body.module_integration !== undefined) { 
            data.module_integration = !!body.module_integration; 
            data.flow_integration_access = !!body.module_integration; 
            data.api_access = !!body.module_integration;
            data.abandoned_cart_recovery_enabled = !!body.module_integration;
        }
        
        if (body.max_users !== undefined) data.max_users = parseInt(body.max_users) || 1;

        const pkg = await prisma.subscriptionPlan.update({
            where: { id },
            data
        });

        return NextResponse.json({ data: pkg });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to update package" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        // Check if any workspace is using this plan
        const usageCount = await prisma.workspace.count({
            where: { current_plan_id: id }
        });

        if (usageCount > 0) {
            return NextResponse.json({ error: `Cannot delete plan. It's used by ${usageCount} workspaces.` }, { status: 400 });
        }

        await prisma.subscriptionPlan.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to delete package" }, { status: 500 });
    }
}
