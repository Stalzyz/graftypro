
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
        if (body.yearly_price !== undefined) {
            data.yearly_price = parseFloat(body.yearly_price) || 0;
        }

        // Limits
        if (body.max_contacts !== undefined) data.max_contacts = parseInt(body.max_contacts);
        if (body.max_flows !== undefined) data.max_flows = parseInt(body.max_flows);
        if (body.max_campaigns !== undefined) data.max_campaigns = parseInt(body.max_campaigns);
        if (body.max_messages !== undefined) data.max_messages = parseInt(body.max_messages);

        // Access
        if (body.api_access !== undefined) data.api_access = !!body.api_access;
        if (body.crm_access !== undefined) data.crm_access = !!body.crm_access;
        if (body.flow_builder_access !== undefined) data.flow_builder_access = !!body.flow_builder_access;
        if (body.drip_campaign_access !== undefined) data.drip_campaign_access = !!body.drip_campaign_access;
        if (body.commerce_access !== undefined) data.commerce_access = !!body.commerce_access;
        if (body.edu_engine_access !== undefined) data.edu_engine_access = !!body.edu_engine_access;
        if (body.is_public !== undefined) data.is_public = !!body.is_public;
        if (body.credits !== undefined) data.credits = parseInt(body.credits) || 0;
        if (body.is_featured !== undefined) data.is_featured = !!body.is_featured;

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
