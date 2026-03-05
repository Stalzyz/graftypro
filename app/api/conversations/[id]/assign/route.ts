import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCurrentUser } from "../../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { agentId } = await req.json();

        const conversation = await prisma.conversation.update({
            where: {
                id: params.id,
                workspace_id: user.workspaceId
            },
            data: {
                assigned_to: agentId || null
            },
            include: {
                agent: {
                    select: {
                        id: true,
                        first_name: true,
                        email: true
                    }
                }
            }
        });

        return NextResponse.json({ success: true, data: conversation });

    } catch (error: any) {
        console.error("Assign Conversation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
