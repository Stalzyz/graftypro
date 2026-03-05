import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const columnId = params.id;
        const body = await req.json();

        // Check if column belongs to workspace
        const column = await prisma.universalCrmColumn.findFirst({
            where: { id: columnId, workspace_id: user.workspaceId }
        });

        if (!column) {
            return NextResponse.json({ error: "Column not found" }, { status: 404 });
        }

        // Only allow updating visibility and name for now
        const updatedColumn = await prisma.universalCrmColumn.update({
            where: { id: columnId },
            data: {
                is_visible: body.is_visible !== undefined ? body.is_visible : column.is_visible,
                name: body.name || column.name,
                order: body.order !== undefined ? body.order : column.order
            }
        });

        return NextResponse.json(updatedColumn);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const columnId = params.id;

        // Check if column belongs to workspace
        const column = await prisma.universalCrmColumn.findFirst({
            where: { id: columnId, workspace_id: user.workspaceId }
        });

        if (!column) {
            return NextResponse.json({ error: "Column not found" }, { status: 404 });
        }

        await prisma.universalCrmColumn.delete({
            where: { id: columnId }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
