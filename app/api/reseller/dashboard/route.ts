import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getResellerSession } from "@/lib/reseller/auth-helper";

export const dynamic = "force-dynamic";

/**
 * PHASE 9: RESELLER'S OWN DASHBOARD API
 * Data specifically for the logged-in reseller.
 */
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
                    select: { vendor_mappings: true }
                }
            }
        });

        if (!reseller) return NextResponse.json({ error: "Reseller not found" }, { status: 404 });

        // Performance Calculations
        const [recentMappings, recentLedger, pendingPayout] = await Promise.all([
            prisma.resellerVendorMap.findMany({
                where: { reseller_id: resellerId },
                orderBy: { mapped_at: 'desc' },
                take: 5,
                include: { workspace: true }
            }),
            prisma.resellerLedger.findMany({
                where: { reseller_id: resellerId },
                orderBy: { created_at: 'desc' },
                take: 10
            }),
            prisma.resellerPayoutRequest.findFirst({
                where: { reseller_id: resellerId, status: 'PENDING' },
                orderBy: { created_at: 'desc' }
            })
        ]);

        return NextResponse.json({
            success: true,
            data: {
                profile: {
                    name: reseller.name,
                    referral_code: reseller.referral_code,
                    status: reseller.status,
                    is_frozen: reseller.is_frozen,
                    freeze_reason: reseller.freeze_reason
                },
                financials: {
                    wallet_balance: reseller.wallet_balance,
                    total_earned: reseller.total_earned,
                    tier: reseller.tier?.name || "Starter",
                    next_tier_progress: reseller.tier ? `${reseller._count.vendor_mappings} vendors` : '0 vendors'
                },
                recentActivity: {
                    vendors: recentMappings,
                    earnings: recentLedger,
                    payout: pendingPayout
                }
            }
        });

    } catch (error: any) {
        return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
    }
}
