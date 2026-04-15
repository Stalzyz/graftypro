
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getAdminSession } from "../../../../../lib/admin-auth";
import { CRMService } from "../../../../../lib/services/crm-service";

export const dynamic = "force-dynamic";

/**
 * SUPER ADMIN CRM STATS API
 * Serves aggregated financial and pipeline metrics for executive oversight.
 */

export async function GET() {
    try {
        const session = await getAdminSession();
        if (!session || !['SUPER_ADMIN', 'FINANCE', 'SALES'].includes(session.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const [pipelineStats, targets] = await Promise.all([
            CRMService.getPipelineStats(),
            CRMService.getRevenueGoals()
        ]);

        // Month-to-date actual values
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [mtdRevenue, mtdVendors] = await Promise.all([
            prisma.invoice.aggregate({
                where: {
                    created_at: { gte: startOfMonth },
                    status: "ACTIVE",
                    payment_status: "PAID"
                },
                _sum: { total_amount: true }
            }),
            prisma.workspace.count({
                where: { created_at: { gte: startOfMonth } }
            })
        ]);

        return NextResponse.json({
            pipeline: pipelineStats,
            targets,
            mtd: {
                revenue: Number(mtdRevenue?._sum?.total_amount || 0),
                vendors: mtdVendors || 0
            }
        });
    } catch (error: any) {
        console.error("CRM Stats Generation Error:", error);
        return NextResponse.json({ 
            error: "Telemetry fetch failed", 
            details: process.env.NODE_ENV === 'development' ? error.message : undefined 
        }, { status: 500 });
    }
}
