import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = params;

        // 1. Verify ownership via RAW SQL
        const activeWorkspaceId = user.workspaceId || user.workspace_id;
        const sources: any[] = await prisma.$queryRawUnsafe(
            `SELECT id FROM "knowledge_sources" WHERE id = $1 AND workspace_id = $2`,
            id,
            activeWorkspaceId
        );
        
        const source = sources[0];

        if (!source) {
            return NextResponse.json({ error: "Source not found or unauthorized" }, { status: 404 });
        }

        // 2. Cascading delete via RAW SQL (Chunks then Source)
        await prisma.$executeRawUnsafe(
            `DELETE FROM "knowledge_chunks" WHERE source_id = $1`,
            id
        );
        await prisma.$executeRawUnsafe(
            `DELETE FROM "knowledge_sources" WHERE id = $1`,
            id
        );

        return NextResponse.json({ success: true, message: "Source deleted permanently" });
    } catch (error) {
        console.error("Delete Source Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
