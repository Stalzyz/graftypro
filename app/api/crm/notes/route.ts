import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const contactId = searchParams.get("contactId");

        if (!contactId) return NextResponse.json({ error: "Contact ID required" }, { status: 400 });

        const notes = await prisma.internalNote.findMany({
            where: {
                workspace_id: user.workspaceId,
                contact_id: contactId
            },
            include: {
                user: {
                    select: {
                        first_name: true,
                        last_name: true
                    }
                }
            },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json({ data: notes });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { contactId, content } = await req.json();

        if (!contactId || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const note = await prisma.internalNote.create({
            data: {
                workspace_id: user.workspaceId,
                contact_id: contactId,
                user_id: user.userId,
                content
            }
        });

        return NextResponse.json({ success: true, data: note });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
