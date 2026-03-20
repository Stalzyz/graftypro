import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCurrentUser } from "../../../../../lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { status } = await req.json();
        
        const followUp = await prisma.followUp.findUnique({ where: { id: params.id } });
        if (!followUp || followUp.workspace_id !== user.workspaceId) {
            return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
        }

        const updated = await prisma.followUp.update({
            where: { id: params.id },
            data: { status }
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error) {
        console.error("Update FollowUp Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
