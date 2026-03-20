import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * ROBUST MANUAL VALIDATION FOR PATCH
 * Ensures data integrity during updates.
 */
function validatePatch(body: any) {
    const data: any = {};
    
    if (body.name !== undefined) data.name = String(body.name);
    if (body.description !== undefined) data.description = String(body.description);
    if (body.monthly_price !== undefined) data.monthly_price = Number(body.monthly_price);
    if (body.currency !== undefined) data.currency = String(body.currency);
    if (body.max_contacts !== undefined) data.max_contacts = Number(body.max_contacts);
    if (body.max_messages !== undefined) data.max_messages = Number(body.max_messages);
    if (body.max_flows !== undefined) data.max_flows = Number(body.max_flows);
    if (body.is_featured !== undefined) data.is_featured = !!body.is_featured;
    if (body.badge_text !== undefined) data.badge_text = String(body.badge_text);
    if (body.cta_label !== undefined) data.cta_label = String(body.cta_label);
    
    // Modules
    if (body.module_crm !== undefined) {
        data.module_crm = !!body.module_crm;
        data.crm_access = !!body.module_crm;
        data.flow_logic_access = !!body.module_crm;
    }
    if (body.module_ecommerce !== undefined) {
        data.module_ecommerce = !!body.module_ecommerce;
        data.commerce_access = !!body.module_ecommerce;
        data.flow_commerce_access = !!body.module_ecommerce;
    }
    if (body.module_academy !== undefined) data.module_academy = !!body.module_academy;
    if (body.module_integration !== undefined) data.module_integration = !!body.module_integration;

    return data;
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser(req);
        if (!user || user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id } = params;
        const data = validatePatch(body);

        const pkg = await prisma.subscriptionPlan.update({
            where: { id },
            data
        });

        return NextResponse.json({ data: pkg });
    } catch (error: any) {
        console.error("[PATCH_PACKAGE_ERROR]", error);
        return NextResponse.json({ error: error.message || "Failed to update package" }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser(req);
        if (!user || user.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

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
        console.error("[DELETE_PACKAGE_ERROR]", error);
        return NextResponse.json({ error: error.message || "Failed to delete package" }, { status: 500 });
    }
}
