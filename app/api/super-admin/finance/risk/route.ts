/**
 * Super Admin - Risk & Fraud Analytics API
 * 
 * GET /api/super-admin/finance/risk
 */

import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { requireSuperAdmin } from "../../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        await requireSuperAdmin();

        // 1. Fetch wallets with High Velocity relative to their limits
        // Or simply fetch all with their current 24h velocity
        const wallets = await prisma.vendorWallet.findMany({
            include: {
                workspace: {
                    select: { name: true }
                }
            },
            take: 20,
            orderBy: {
                total_used: 'desc' // Just for now
            }
        });

        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const riskData = await Promise.all(wallets.map(async (w) => {
            const velocity = await prisma.creditTransaction.aggregate({
                where: {
                    workspace_id: w.workspace_id,
                    type: 'DEDUCTION',
                    created_at: { gte: last24h }
                },
                _sum: { amount: true }
            });

            const currentVelocity = Math.abs(Number(velocity._sum.amount || 0));
            const limit = Number(w.max_daily_velocity || 10000);
            const riskScore = (currentVelocity / limit) * 100;

            return {
                id: w.id,
                workspace_name: w.workspace.name,
                workspace_id: w.workspace_id,
                current_velocity: currentVelocity,
                daily_limit: limit,
                risk_score: riskScore,
                is_frozen: w.is_frozen,
                is_automated_blocked: w.is_automated_blocked
            };
        }));

        // Sort by risk score
        riskData.sort((a, b) => b.risk_score - a.risk_score);

        return NextResponse.json({
            success: true,
            risk_profiles: riskData
        });

    } catch (error: any) {
        console.error("Risk Analytics Error:", error);
        return NextResponse.json({ error: error.message || "Failed to fetch risk data" }, { status: 500 });
    }
}
