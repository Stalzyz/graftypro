import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const conversations = await prisma.conversation.findMany({
            where: { workspace_id: user.workspaceId },
            include: {
                contact: true,
                messages: {
                    orderBy: { created_at: "desc" },
                    take: 1
                }
            },
            orderBy: { updated_at: "desc" }
        });

        return NextResponse.json({ data: conversations });
    } catch (error) {
        console.error("List Conversations Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
