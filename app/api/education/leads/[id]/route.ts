import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCurrentUser } from "../../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const lead = await prisma.eduLead.findFirst({
            where: { id: params.id, workspace_id: user.workspaceId },
            include: {
                activities: { orderBy: { created_at: "desc" } },
                form: true
            }
        });

        if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        return NextResponse.json({ success: true, data: lead });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { status, notes, counselor_id, potential_revenue } = body;

        const currentLead = await prisma.eduLead.findFirst({
            where: { id: params.id, workspace_id: user.workspaceId }
        });

        if (!currentLead) return NextResponse.json({ error: "Lead not found" }, { status: 404 });

        const updateData: any = {};
        const activities: any[] = [];

        if (status && status !== currentLead.status) {
            updateData.status = status;
            activities.push({
                type: "STATUS_CHANGE",
                content: `Status changed from ${currentLead.status} to ${status}`,
                old_status: currentLead.status,
                new_status: status
            });
        }

        if (notes !== undefined) {
            updateData.notes = notes;
            if (notes && notes !== currentLead.notes) {
                activities.push({
                    type: "NOTE_ADDED",
                    content: `Note added: ${notes.substring(0, 50)}${notes.length > 50 ? '...' : ''}`
                });
            }
        }

        if (counselor_id !== undefined) updateData.counselor_id = counselor_id;
        if (potential_revenue !== undefined) updateData.potential_revenue = potential_revenue;

        const updatedLead = await prisma.eduLead.update({
            where: { id: params.id },
            data: {
                ...updateData,
                activities: activities.length > 0 ? { create: activities } : undefined
            }
        });

        return NextResponse.json({ success: true, data: updatedLead });
    } catch (error) {
        console.error("PATCH Education Lead Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await prisma.eduLead.deleteMany({
            where: { id: params.id, workspace_id: user.workspaceId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
