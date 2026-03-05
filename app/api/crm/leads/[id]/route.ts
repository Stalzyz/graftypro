import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();

        // Check if lead exists and belongs to workspace
        const existingLead = await prisma.universalCrmLead.findUnique({
            where: { id: params.id }
        });

        if (!existingLead || existingLead.workspace_id !== user.workspaceId) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        const updateData: any = {};
        if ('name' in body) updateData.name = body.name;
        if ('phone' in body) updateData.phone = body.phone;
        if ('email' in body) updateData.email = body.email;
        if ('source' in body) updateData.source = body.source;
        if ('status' in body) updateData.status = body.status;
        if ('deal_value' in body) updateData.deal_value = body.deal_value;
        if ('stage_id' in body) updateData.stage_id = body.stage_id;
        if ('assigned_to' in body) updateData.assigned_to = body.assigned_to;
        if ('custom_data' in body) updateData.custom_data = body.custom_data;

        const lead = await prisma.universalCrmLead.update({
            where: { id: params.id },
            data: updateData,
            include: { stage: true }
        });

        // Log Activity (Stage Change or Edit)
        let action = 'UPDATED';
        let notes = 'Lead details updated';
        if (existingLead.stage_id !== body.stage_id) {
            action = 'STAGE_CHANGE';
            notes = `Lead moved to new stage`;
        }

        await prisma.universalCrmActivity.create({
            data: {
                workspace_id: user.workspaceId,
                lead_id: lead.id,
                user_id: user.id || null,
                type: action,
                notes: notes
            }
        });

        return NextResponse.json(lead);
    } catch (error: any) {
        console.error("Edit Lead Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const existingLead = await prisma.universalCrmLead.findUnique({
            where: { id: params.id }
        });

        if (!existingLead || existingLead.workspace_id !== user.workspaceId) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        await prisma.universalCrmLead.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Delete Lead Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
