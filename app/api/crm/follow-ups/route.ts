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

        let where: any = { workspace_id: user.workspaceId };
        if (contactId) where.contact_id = contactId;

        const followUps = await prisma.followUp.findMany({
            where,
            include: { contact: true },
            orderBy: { scheduled_at: "asc" }
        });

        return NextResponse.json({ data: followUps });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { contactId, scheduledAt, notes } = await req.json();

        if (!contactId || !scheduledAt) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const followUp = await prisma.followUp.create({
            data: {
                workspace_id: user.workspaceId,
                contact_id: contactId,
                user_id: user.userId,
                scheduled_at: new Date(scheduledAt),
                notes,
                status: "PENDING"
            }
        });

        return NextResponse.json({ success: true, data: followUp });
    } catch (error: any) {
        console.error("Create FollowUp Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
