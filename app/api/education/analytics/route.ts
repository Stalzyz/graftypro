import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const workspace_id = user.workspaceId;

        // Run queries in parallel
        const [
            totalLeads,
            leadsThisMonth,
            enrolledLeads,
            revenueData,
            statusCounts,
            sourceCounts
        ] = await Promise.all([
            prisma.eduLead.count({ where: { workspace_id } }),
            prisma.eduLead.count({
                where: {
                    workspace_id,
                    created_at: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
                }
            }),
            prisma.eduLead.count({ where: { workspace_id, status: "ENROLLED" } }),
            prisma.eduLead.aggregate({
                where: { workspace_id, status: "ENROLLED" },
                _sum: { potential_revenue: true }
            }),
            prisma.eduLead.groupBy({
                by: ['status'],
                where: { workspace_id },
                _count: true
            }),
            prisma.eduLead.groupBy({
                by: ['lead_source'],
                where: { workspace_id },
                _count: true
            })
        ]);

        const conversionRate = totalLeads > 0 ? (enrolledLeads / totalLeads) * 100 : 0;

        return NextResponse.json({
            success: true,
            stats: {
                totalLeads,
                leadsThisMonth,
                enrolledLeads,
                totalRevenue: revenueData._sum.potential_revenue || 0,
                conversionRate: conversionRate.toFixed(2),
                statusBreakdown: statusCounts,
                sourceBreakdown: sourceCounts
            }
        });
    } catch (error) {
        console.error("GET Education Analytics Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
