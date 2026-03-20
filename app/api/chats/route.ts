import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { getCurrentUser } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Fetch conversations with contact details
        const conversations = await prisma.conversation.findMany({
            where: { workspace_id: user.workspaceId },
            include: {
                contact: {
                    select: { id: true, name: true, phone: true }
                },
                messages: {
                    take: 1,
                    orderBy: { created_at: "desc" }
                },
                _count: {
                    select: {
                        messages: {
                            where: {
                                direction: "INBOUND",
                                status: { not: "READ" }
                            }
                        }
                    }
                }
            },
            orderBy: { updated_at: "desc" }
        });

        // Format for UI
        const data = conversations.map(c => ({
            id: c.id,
            contact: c.contact,
            lastMessage: c.messages[0] || null,
            unreadCount: (c as any)._count.messages,
            updatedAt: c.updated_at
        }));

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
