
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";
import { DripService } from "../../../../lib/services/drip-service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { contactId, dripId, metadata } = await req.json();

        if (!contactId || !dripId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Verify contact belongs to workspace
        const contact = await prisma.contact.findUnique({
            where: { id: contactId, workspace_id: user.workspaceId }
        });

        if (!contact) return NextResponse.json({ error: "Contact not found" }, { status: 404 });

        const enrollment = await DripService.enroll(user.workspaceId, contactId, dripId, metadata || {});

        if (!enrollment) {
            return NextResponse.json({ error: "Could not enroll contact. Sequence might be inactive or already enrolled." }, { status: 400 });
        }

        return NextResponse.json({ success: true, enrollment });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
