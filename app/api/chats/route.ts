import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

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
                // Fetch last message via sorting (or relation if optimized)
                messages: {
                    take: 1,
                    orderBy: { created_at: "desc" }
                }
            },
            orderBy: { updated_at: "desc" }
        });

        // Format for UI
        const data = conversations.map(c => ({
            id: c.id,
            contact: c.contact,
            lastMessage: c.messages[0] || null,
            unreadCount: 0, // Placeholder for unread count logic
            updatedAt: c.updated_at
        }));

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
