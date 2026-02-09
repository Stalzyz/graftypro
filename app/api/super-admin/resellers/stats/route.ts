import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/admin-auth";

/**
 * PHASE 8: ADMIN DASHBOARD DATA
 * Provides bird's-eye view of the Reseller Engine.
 */
export async function GET(req: Request) {
    try {
        // 1. Authorization
        await requireSuperAdmin();

        // --- AUTO-SEED INITIAL TIERS (Safety) ---
        const { ResellerService } = require("@/lib/reseller/service");
        await ResellerService.seedInitialTiers();

        // 2. Fetch Aggregates
        const [totalResellers, activeResellers, pendingPayouts, totalEarnings] = await Promise.all([
            prisma.reseller.count(),
            prisma.reseller.count({ where: { status: 'ACTIVE' } }),
            prisma.resellerPayoutRequest.count({ where: { status: 'PENDING' } }),
            prisma.reseller.aggregate({ _sum: { total_earned: true } })
        ]);

        // 3. High Risk Resellers
        const highRiskResellers = await prisma.reseller.findMany({
            where: {
                OR: [
                    { risk_score: { gte: 70 } },
                    { is_frozen: true }
                ]
            },
            orderBy: { risk_score: 'desc' },
            take: 10
        });

        // 4. Latest Applications
        const latestApplications = await prisma.reseller.findMany({
            where: { status: 'PENDING' },
            orderBy: { created_at: 'desc' },
            take: 10
        });

        return NextResponse.json({
            success: true,
            stats: {
                totalResellers,
                activeResellers,
                pendingPayouts,
                totalEarnings: totalEarnings._sum.total_earned || 0
            },
            highRisk: highRiskResellers,
            pendingApps: latestApplications
        });

    } catch (error: any) {
        console.error("Admin Reseller Stats Error:", error);
        return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
    }
}
