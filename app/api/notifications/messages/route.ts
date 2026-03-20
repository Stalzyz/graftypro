import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Fetch last 5 inbound messages that are relatively new (e.g. last 1 hour)
        // to avoid overwhelming with old messages if they just logged in.
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        const recentMessages = await prisma.message.findMany({
            where: {
                workspace_id: user.workspaceId,
                direction: "INBOUND",
                status: { not: "READ" },
                created_at: { gte: oneHourAgo }
            },
            orderBy: { created_at: "desc" },
            take: 10, // Increased to 10 for better coverage
            include: {
                contact: {
                    select: { name: true, phone: true }
                }
            }
        });

        return NextResponse.json({ success: true, data: recentMessages });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
