
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getAdminSession } from "../../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [revenueStats, gstStats, pendingPayouts, whiteLabelRevenue] = await Promise.all([
            prisma.invoice.aggregate({
                where: { status: "ACTIVE", payment_status: "PAID" },
                _sum: { total_amount: true, net_amount: true }
            }),
            prisma.invoice.aggregate({
                where: { status: "ACTIVE", payment_status: "PAID" },
                _sum: { cgst_amount: true, sgst_amount: true, igst_amount: true }
            }),
            prisma.reseller.aggregate({
                _sum: { wallet_balance: true }
            }),
            prisma.invoice.aggregate({
                where: { reseller_id: { not: null }, status: "ACTIVE", payment_status: "PAID" },
                _sum: { total_amount: true }
            })
        ]);

        // Monthly trend (last 6 months)
        const months = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
            months.push({
                name: date.toLocaleString('default', { month: 'short' }),
                date: date,
                end: end
            });
        }

        const trend = await Promise.all(months.map(async (m) => {
            const rev = await prisma.invoice.aggregate({
                where: {
                    created_at: { gte: m.date, lte: m.end },
                    status: "ACTIVE",
                    payment_status: "PAID"
                },
                _sum: { total_amount: true }
            });
            return {
                month: m.name,
                revenue: Number(rev._sum.total_amount || 0)
            };
        }));

        return NextResponse.json({
            total_revenue: Number(revenueStats._sum.total_amount || 0),
            net_revenue: Number(revenueStats._sum.net_amount || 0),
            gst: {
                total: Number((gstStats._sum.cgst_amount || 0) + (gstStats._sum.sgst_amount || 0) + (gstStats._sum.igst_amount || 0)),
                cgst: Number(gstStats._sum.cgst_amount || 0),
                sgst: Number(gstStats._sum.sgst_amount || 0),
                igst: Number(gstStats._sum.igst_amount || 0)
            },
            pending_payouts: Number(pendingPayouts._sum.wallet_balance || 0),
            white_label_revenue: Number(whiteLabelRevenue._sum.total_amount || 0),
            trend
        });
    } catch (error: any) {
        console.error("Finance Stats Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
