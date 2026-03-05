
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getAdminSession } from "../../../../../lib/admin-auth";
import { CRMService } from "../../../../../lib/services/crm-service";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const pipelineStats = await CRMService.getPipelineStats();
        const targets = await CRMService.getRevenueGoals();

        // Month-to-date actual values
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const mtdRevenue = await prisma.invoice.aggregate({
            where: {
                created_at: { gte: startOfMonth },
                status: "ACTIVE",
                payment_status: "PAID"
            },
            _sum: { total_amount: true }
        });

        const mtdVendors = await prisma.workspace.count({
            where: { created_at: { gte: startOfMonth } }
        });

        return NextResponse.json({
            pipeline: pipelineStats,
            targets,
            mtd: {
                revenue: Number(mtdRevenue._sum.total_amount || 0),
                vendors: mtdVendors
            }
        });
    } catch (error: any) {
        console.error("CRM Stats Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
