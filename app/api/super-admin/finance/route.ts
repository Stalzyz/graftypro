
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getAdminSession } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

// GET GLOBAL FINANCIALS
export async function GET(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 1. Transactions List
        const transactions = await prisma.transaction.findMany({
            take: 20,
            orderBy: { created_at: "desc" },
            include: {
                workspace: { select: { name: true } }
            }
        });

        // 2. Aggregations
        const [
            totalRevenue,
            totalCredits,
            pendingPayouts
        ] = await Promise.all([
            // Total Subscription/Charges Revenue
            prisma.transaction.aggregate({
                where: {
                    type: { in: ["SUBSCRIPTION_CHARGE", "USAGE_CHARGE", "CREDIT_PURCHASE"] },
                    status: "SUCCESS"
                },
                _sum: { amount: true }
            }),
            // Total Credits Balance (Liability)
            prisma.creditWallet.aggregate({
                _sum: { balance: true }
            }),
            // Pending Commission Payouts
            prisma.partnerPayout.aggregate({
                where: { status: "REQUESTED" },
                _sum: { amount: true }
            })
        ]);

        return NextResponse.json({
            transactions: transactions.map(t => ({
                id: t.id,
                amount: t.amount,
                type: t.type,
                status: t.status,
                date: t.created_at,
                source: t.workspace?.name || "System"
            })),
            stats: {
                revenue: totalRevenue._sum.amount || 0,
                liability: totalCredits._sum.balance || 0, // Unused credits
                pending_payouts: pendingPayouts._sum.amount || 0
            }
        });

    } catch (e) {
        console.error("Finance API Error", e);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
