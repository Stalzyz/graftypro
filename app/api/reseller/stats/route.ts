
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getResellerSession } from "../../../../lib/reseller/auth-helper";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const resellerId = session.userId;

        const reseller = await prisma.reseller.findUnique({
            where: { id: resellerId },
            include: {
                tier: true,
                _count: {
                    select: {
                        vendor_mappings: true,
                        payout_requests: { where: { status: "PENDING" } },
                        leads: true,
                        coupons: true
                    }
                }
            }
        });

        if (!reseller) return NextResponse.json({ error: "Not Found" }, { status: 404 });

        // Financial Metrics
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const monthEarnings = await prisma.resellerLedger.aggregate({
            where: { reseller_id: resellerId, type: "COMMISSION", created_at: { gte: startOfMonth } },
            _sum: { amount: true }
        });

        const todayEarnings = await prisma.resellerLedger.aggregate({
            where: { reseller_id: resellerId, type: "COMMISSION", created_at: { gte: startOfToday } },
            _sum: { amount: true }
        });

        // Tier Progress Logic
        const nextTier = await prisma.resellerTier.findFirst({
            where: {
                min_vendors: { gt: reseller._count.vendor_mappings }
            },
            orderBy: { min_vendors: 'asc' }
        });

        // Growth Alert: Vendors with low balance
        const lowBalanceVendors = await prisma.workspace.count({
            where: {
                reseller_id: resellerId,
                wallet: { current_balance: { lt: 500 } }
            }
        });

        // Recent Activity
        const recentLedger = await prisma.resellerLedger.findMany({
            where: { reseller_id: resellerId },
            take: 10,
            orderBy: { created_at: "desc" }
        });

        // Monthly Revenue & Growth Tracking (Hybrid Engine)
        const monthStats = await prisma.resellerMonthlyStats.findUnique({
            where: {
                reseller_id_month_year: {
                    reseller_id: resellerId,
                    month: now.getMonth() + 1,
                    year: now.getFullYear()
                }
            }
        });

        // Load Global Rev Engine Config for bonus thresholds
        const revConfig = await prisma.systemConfig.findUnique({ where: { id: "global" } });

        const revMonth = Number(monthStats?.total_revenue || 0);
        const profitMonth = Number(monthStats?.net_profit || 0);

        // Calculate Thresholds & Est Bonus
        let currentTierBonus = 0;
        let nextThreshold = Number(revConfig?.rev_tier_threshold_1 || 50000);
        let bonusPct = 0;

        if (revMonth >= Number(revConfig?.rev_tier_threshold_2 || 200000)) {
            bonusPct = Number(revConfig?.rev_tier_bonus_2 || 5);
            nextThreshold = 0; // Max reached
        } else if (revMonth >= Number(revConfig?.rev_tier_threshold_1 || 50000)) {
            bonusPct = Number(revConfig?.rev_tier_bonus_1 || 2);
            nextThreshold = Number(revConfig?.rev_tier_threshold_2 || 200000);
        }

        const estBonus = (profitMonth * bonusPct) / 100;

        return NextResponse.json({
            profile: {
                name: reseller.name,
                business_name: reseller.business_name,
                referral_code: reseller.referral_code,
                tier: reseller.tier?.name || "Free Agent",
                commission_rate: reseller.tier?.commission_rate || reseller.base_commission,
                // @ts-ignore
                role: reseller.role,
                // @ts-ignore
                kyc_status: reseller.kyc_status,
                // @ts-ignore
                email_verified: reseller.email_verified
            },
            wallet: {
                balance: Number(reseller.wallet_balance),
                total_earned: Number(reseller.total_earned),
                pending_payouts: reseller._count.payout_requests,
                this_month: Number(monthEarnings._sum.amount || 0),
                today: Number(todayEarnings._sum.amount || 0)
            },
            monthly: {
                revenue: revMonth,
                profit: profitMonth,
                next_threshold: nextThreshold,
                bonus_pct: bonusPct,
                est_bonus: estBonus,
                remaining: nextThreshold > 0 ? nextThreshold - revMonth : 0
            },
            gamification: {
                current_vendors: reseller._count.vendor_mappings,
                next_tier: nextTier ? {
                    name: nextTier.name,
                    requirement: nextTier.min_vendors,
                    remaining: nextTier.min_vendors - reseller._count.vendor_mappings,
                    bonus: nextTier.commission_rate
                } : null
            },
            alerts: {
                low_balance_vendors: lowBalanceVendors,
                leads_count: reseller._count.leads
            },
            recent_activity: recentLedger
        });

    } catch (error) {
        console.error("Reseller Stats Error:", error);
        return NextResponse.json({ error: "Load Failed" }, { status: 500 });
    }
}
