import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getResellerSession } from "@/lib/reseller/auth-helper";

export const dynamic = "force-dynamic";

/**
 * PHASE 10: REPORTING & TAX READINESS
 * Generates financial summaries for resellers.
 */
export async function GET(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const resellerId = session.userId;

        const { searchParams } = new URL(req.url);
        const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
        const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0, 23, 59, 59);

        const [earnings, payouts, mappings] = await Promise.all([
            prisma.resellerLedger.findMany({
                where: {
                    reseller_id: resellerId,
                    type: 'COMMISSION',
                    created_at: { gte: startDate, lte: endDate }
                }
            }),
            prisma.resellerPayoutRequest.findMany({
                where: {
                    reseller_id: resellerId,
                    status: 'PAID',
                    processed_at: { gte: startDate, lte: endDate }
                }
            }),
            prisma.resellerVendorMap.count({
                where: {
                    reseller_id: resellerId,
                    mapped_at: { gte: startDate, lte: endDate }
                }
            })
        ]);

        const totalEarned = earnings.reduce((sum, entry) => sum + Number(entry.amount), 0);
        const totalPaid = payouts.reduce((sum, entry) => sum + Number(entry.amount), 0);

        return NextResponse.json({
            success: true,
            report: {
                period: `${year}-${month}`,
                resellerId,
                stats: {
                    totalEarned,
                    totalPaid,
                    newVendors: mappings,
                    entryCount: earnings.length
                },
                transactions: {
                    earnings: earnings.slice(0, 50), // Sample for preview
                    payouts
                }
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: "Report generation failed" }, { status: 500 });
    }
}
