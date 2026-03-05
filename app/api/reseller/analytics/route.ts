import { NextResponse } from "next/server";
import { ResellerAnalyticsService } from "../../../../lib/reseller/analytics";

export const dynamic = 'force-dynamic';

/**
 * PHASE: ANALYTICS TOWER API
 * Serves aggregated data for the Reseller Overview.
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const resellerId = searchParams.get('resellerId');

        if (!resellerId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const stats = await ResellerAnalyticsService.getDashboardStats(resellerId);
        const topVendors = await ResellerAnalyticsService.getTopVendors(resellerId);
        const chartData = await ResellerAnalyticsService.getEarningsChart(resellerId);
        const tierProgress = await ResellerAnalyticsService.getTierProgress(resellerId);

        return NextResponse.json({
            success: true,
            data: {
                stats,
                topVendors,
                chartData,
                tierProgress
            }
        });

    } catch (error: any) {
        console.error("Reseller Analytics Error:", error);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}
