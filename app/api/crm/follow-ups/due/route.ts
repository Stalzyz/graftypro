import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCurrentUser } from "../../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const followUps = await prisma.followUp.findMany({
            where: {
                workspace_id: user.workspaceId,
                status: "PENDING",
                scheduled_at: {
                    lte: new Date()
                }
            },
            include: { contact: true },
            orderBy: { scheduled_at: "asc" }
        });

        return NextResponse.json({ data: followUps });
    } catch (error) {
        console.error("Fetch Due FollowUps Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
