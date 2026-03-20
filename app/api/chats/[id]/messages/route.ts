import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCurrentUser } from "../../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = params;

        // Auto-mark all inbound messages in this conversation as READ
        await prisma.message.updateMany({
            where: {
                conversation_id: id,
                workspace_id: user.workspaceId,
                direction: "INBOUND",
                status: { not: "READ" }
            },
            data: { status: "READ" }
        });

        const messages = await prisma.message.findMany({
            where: {
                conversation_id: id,
                workspace_id: user.workspaceId // Security check
            },
            orderBy: { created_at: "asc" }
        });

        return NextResponse.json(messages);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
