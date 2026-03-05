import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const stageId = params.id;

        // Check if stage belongs to workspace
        const stage = await prisma.universalCrmStage.findFirst({
            where: { id: stageId, workspace_id: user.workspaceId }
        });

        if (!stage) {
            return NextResponse.json({ error: "Stage not found" }, { status: 404 });
        }

        // Check if leads exist in this stage
        const leadsCount = await prisma.universalCrmLead.count({
            where: { stage_id: stageId }
        });

        if (leadsCount > 0) {
            return NextResponse.json({
                error: `Cannot delete stage with ${leadsCount} leads. Move the leads first.`
            }, { status: 400 });
        }

        await prisma.universalCrmStage.delete({
            where: { id: stageId }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
