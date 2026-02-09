
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export async function GET(req: Request) {
    try {
        const resellerId = headers().get("x-reseller-id");
        if (!resellerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const reseller = await prisma.reseller.findUnique({
            where: { id: resellerId },
            include: {
                tier: true,
                _count: {
                    select: {
                        vendor_mappings: true,
                        payout_requests: { where: { status: "PENDING" } }
                    }
                }
            }
        });

        if (!reseller) return NextResponse.json({ error: "Not Found" }, { status: 404 });

        // Ledger Summary
        const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const thisMonthEarnings = await prisma.resellerLedger.aggregate({
            where: {
                reseller_id: resellerId,
                type: "COMMISSION",
                created_at: { gte: last30Days }
            },
            _sum: { amount: true }
        });

        // Recent Activity
        const recentLedger = await prisma.resellerLedger.findMany({
            where: { reseller_id: resellerId },
            take: 10,
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json({
            profile: {
                name: reseller.name,
                business_name: reseller.business_name,
                referral_code: reseller.referral_code,
                tier: reseller.tier?.name || "Starter",
                commisson_rate: reseller.tier?.commission_rate || reseller.base_commission
            },
            wallet: {
                balance: Number(reseller.wallet_balance),
                total_earned: Number(reseller.total_earned),
                pending_payouts: reseller._count.payout_requests,
                this_month: Number(thisMonthEarnings._sum.amount || 0)
            },
            stats: {
                total_vendors: reseller._count.vendor_mappings,
                risk_score: reseller.risk_score || 0
            },
            recent_activity: recentLedger
        });

    } catch (error) {
        console.error("Reseller Stats Error:", error);
        return NextResponse.json({ error: "Load Failed" }, { status: 500 });
    }
}
