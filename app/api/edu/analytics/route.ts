import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { EduService } from "@/lib/edu/service";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const stats = await EduService.getAnalytics(user.workspaceId);

        // Add course breakdown
        const courseBreakdown = await prisma.eduLead.groupBy({
            by: ['course_interested'],
            where: { workspace_id: user.workspaceId },
            _count: { id: true },
            _sum: { potential_revenue: true }
        });

        // Add monthly trend
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const trend = await prisma.eduLead.findMany({
            where: {
                workspace_id: user.workspaceId,
                created_at: { gte: sixMonthsAgo }
            },
            select: { created_at: true, status: true }
        });

        return NextResponse.json({
            ...stats,
            courseBreakdown,
            trend
        });

    } catch (error: any) {
        console.error("Edu Analytics Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
