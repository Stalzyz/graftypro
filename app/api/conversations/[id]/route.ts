
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Check if conversation belongs to workspace
        const conversation = await prisma.conversation.findUnique({
            where: { id: params.id },
            select: { workspace_id: true }
        });

        if (!conversation || conversation.workspace_id !== user.workspaceId) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        await prisma.conversation.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true, message: "Conversation deleted" });
    } catch (error: any) {
        console.error("Delete Conversation Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
