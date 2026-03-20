import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { conversation_id } = await req.json();
        if (!conversation_id) return NextResponse.json({ error: "Missing conversation_id" }, { status: 400 });

        await prisma.message.updateMany({
            where: {
                conversation_id,
                workspace_id: user.workspaceId,
                direction: "INBOUND",
                status: { not: "READ" }
            },
            data: { status: "READ" }
        });

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
