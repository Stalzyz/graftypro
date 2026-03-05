
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { ids, action, data } = await req.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "No conversation IDs provided" }, { status: 400 });
        }

        if (action === "archive") {
            await prisma.conversation.updateMany({
                where: {
                    id: { in: ids },
                    workspace_id: user.workspaceId
                },
                data: { status: "ARCHIVED" }
            });
        } else if (action === "delete") {
            await prisma.conversation.deleteMany({
                where: {
                    id: { in: ids },
                    workspace_id: user.workspaceId
                }
            });
        } else if (action === "tag") {
            // Prisma doesn't support updateMany with atomic array push
            // So we fetch all contacts and update them individually or in a loop
            const conversations = await prisma.conversation.findMany({
                where: { id: { in: ids }, workspace_id: user.workspaceId },
                select: { contact_id: true }
            });
            const contactIds = conversations.map(c => c.contact_id);

            // This is slightly inefficient but safe for MVP
            for (const contactId of contactIds) {
                const contact = await prisma.contact.findUnique({ where: { id: contactId } });
                if (contact && !contact.tags.includes(data.tag)) {
                    await prisma.contact.update({
                        where: { id: contactId },
                        data: { tags: { push: data.tag } }
                    });
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Bulk Update Error:", error);
        return NextResponse.json({ error: error.message || "Bulk update failed" }, { status: 500 });
    }
}
