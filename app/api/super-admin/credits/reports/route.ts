import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { requireSuperAdmin } from "../../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

/**
 * PHASE 8: REPORTING & RECONCILIATION
 * Aggregate financial metrics across all vendors.
 */
export async function GET(req: Request) {
    try {
        await requireSuperAdmin();

        // 1. Core Aggregates
        const [stats, totalTransactions] = await Promise.all([
            prisma.vendorWallet.aggregate({
                _sum: {
                    current_balance: true,
                    total_purchased: true,
                    total_used: true
                }
            }),
            prisma.creditTransaction.count()
        ]);

        // 2. High Spenders (Last 30 Days)
        const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000));
        const topSpenders = await prisma.creditTransaction.groupBy({
            by: ['workspace_id'],
            where: {
                type: 'DEDUCTION',
                created_at: { gte: thirtyDaysAgo }
            },
            _sum: { amount: true },
            orderBy: {
                _sum: { amount: 'asc' } // amount is negative, so 'asc' gives the most negative (highest spend)
            },
            take: 10
        });

        // 3. Margin Summary (Placeholder for Pricing analysis)
        // In a real scenario, we'd join ledger with pricing to calculate actual profit vs meta cost.

        return NextResponse.json({
            success: true,
            data: {
                summary: stats._sum,
                transaction_count: totalTransactions,
                top_spenders: topSpenders
            }
        });

    } catch (error: any) {
        console.error("Credit Reporting Error:", error);
        return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
    }
}
