import { prisma } from "../db";
import { startOfMonth, subDays, endOfDay, startOfDay } from "date-fns";

export class ResellerAnalyticsService {
    /**
     * PHASE: ANALYTICS TOWER
     * Fetches top-level statistics for the Reseller Dashboard.
     */
    static async getDashboardStats(resellerId: string) {
        const thirtyDaysAgo = subDays(new Date(), 30);

        // 1. Vendor Count (Direct and Mapped)
        const vendorCount = await prisma.workspace.count({
            where: { reseller_id: resellerId }
        });

        const newVendors = await prisma.workspace.count({
            where: {
                reseller_id: resellerId,
                created_at: { gte: thirtyDaysAgo }
            }
        });

        const earningTypes = ['COMMISSION', 'PROFIT_SHARE', 'WALLET_MARGIN', 'TIER_BONUS', 'REVENUE_SHARE', 'BONUS_PAYOUT'];

        const ledgerSummary = await prisma.resellerLedger.aggregate({
            where: { reseller_id: resellerId, type: { in: earningTypes as any }, amount: { gt: 0 } },
            _sum: { amount: true }
        });

        const lastMonthSummary = await prisma.resellerLedger.aggregate({
            where: {
                reseller_id: resellerId,
                type: { in: earningTypes as any },
                amount: { gt: 0 },
                created_at: { gte: thirtyDaysAgo }
            },
            _sum: { amount: true }
        });

        // 3. Message Volume (Sum of all outbound messages for all reseller vendors)
        const messagesCount = await prisma.message.count({
            where: {
                direction: 'OUTBOUND',
                workspace: { reseller_id: resellerId }
            }
        });

        return {
            vendors: {
                total: vendorCount,
                growth: newVendors
            },
            earnings: {
                total: Number(ledgerSummary._sum.amount || 0),
                last30Days: Number(lastMonthSummary._sum.amount || 0)
            },
            usage: {
                totalMessages: messagesCount
            }
        };
    }

    /**
     * Gets a list of top performing vendors.
     */
    static async getTopVendors(resellerId: string, limit = 5) {
        // @ts-ignore
        const workspaces = await prisma.workspace.findMany({
            where: { reseller_id: resellerId },
            include: {
                // @ts-ignore
                _count: {
                    select: { messages: { where: { direction: 'OUTBOUND' } } }
                },
                // @ts-ignore
                ledger_entries: {
                    where: { type: { in: ['COMMISSION', 'PROFIT_SHARE', 'WALLET_MARGIN', 'TIER_BONUS'] as any }, amount: { gt: 0 } },
                    select: { amount: true }
                }
            },
            take: limit
        });

        // @ts-ignore
        return workspaces.map((ws: any) => ({
            id: ws.id,
            name: ws.business_name || ws.name,
            messages: ws._count.messages,
            earnings: ws.ledger_entries.reduce((sum: number, entry: any) => sum + Number(entry.amount), 0)
        })).sort((a: any, b: any) => b.earnings - a.earnings);
    }

    /**
     * Gets daily earnings for chart visualization.
     */
    static async getEarningsChart(resellerId: string, days = 14) {
        const startDate = startOfDay(subDays(new Date(), days));

        const entries = await prisma.resellerLedger.findMany({
            where: {
                reseller_id: resellerId,
                type: { in: ['COMMISSION', 'PROFIT_SHARE', 'WALLET_MARGIN', 'TIER_BONUS'] as any },
                amount: { gt: 0 },
                created_at: { gte: startDate }
            },
            select: {
                amount: true,
                created_at: true
            }
        });

        // Group by day
        const chartData: Record<string, number> = {};
        for (let i = 0; i < days; i++) {
            const dateStr = subDays(new Date(), i).toISOString().split('T')[0];
            chartData[dateStr] = 0;
        }

        entries.forEach(entry => {
            const dateStr = entry.created_at.toISOString().split('T')[0];
            if (chartData[dateStr] !== undefined) {
                chartData[dateStr] += Number(entry.amount);
            }
        });

        return Object.entries(chartData)
            .map(([date, amount]) => ({ date, amount }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    /**
     * Gets current tier and progress towards the next one.
     */
    static async getTierProgress(resellerId: string) {
        const reseller = await prisma.reseller.findUnique({
            where: { id: resellerId },
            include: { tier: true }
        });

        if (!reseller) return null;

        const vendorCount = await prisma.workspace.count({
            where: { reseller_id: resellerId }
        });

        const allTiers = await prisma.resellerTier.findMany({
            orderBy: { min_vendors: 'asc' }
        });

        const currentTier = reseller.tier || allTiers[0];
        const nextTier = allTiers.find(t => t.min_vendors > vendorCount);

        return {
            currentTier: {
                name: currentTier?.name || "Standard",
                rate: Number(currentTier?.commission_rate || reseller.base_commission),
                min_vendors: currentTier?.min_vendors || 0
            },
            nextTier: nextTier ? {
                name: nextTier.name,
                rate: Number(nextTier.commission_rate),
                min_vendors: nextTier.min_vendors,
                needed: nextTier.min_vendors - vendorCount
            } : null,
            totalVendors: vendorCount,
            progress: nextTier
                ? Math.min(100, (vendorCount / nextTier.min_vendors) * 100)
                : 100
        };
    }
}
