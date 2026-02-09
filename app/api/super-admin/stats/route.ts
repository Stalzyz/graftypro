
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

// PHASE 2: Global Stats
export async function GET(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Parallel Stat Fetching
        const [
            vendorsCount,
            messagesTotal,
            totalRevenue,
            recentVendors
        ] = await Promise.all([
            // Total Active Vendors
            prisma.workspace.count(),
            // Total Message Volume (Global)
            prisma.message.count({ where: { direction: "OUTBOUND" } }),
            // Total Revenue (Paid Orders)
            prisma.order.aggregate({
                where: { status: "PAID" },
                _sum: { total_amount: true }
            }),
            // Recent Signups (Growth Signal)
            prisma.workspace.findMany({
                take: 5,
                orderBy: { created_at: "desc" },
                select: { id: true, name: true, created_at: true, plan: true }
            })
        ]);

        // 5. Risk Alerts (Phase 2 & 5)
        const riskAlerts = await prisma.whatsAppAccount.findMany({
            where: {
                OR: [
                    { health_status: "CRITICAL" },
                    { integration_status: "DEGRADED" }
                ]
            },
            include: { workspace: true },
            take: 5
        });

        return NextResponse.json({
            vendorsCount,
            messagesTotal,
            totalRevenue: totalRevenue._sum.total_amount || 0,
            recentVendors: recentVendors.map(v => ({
                ...v,
                joined_at: v.created_at.toISOString()
            })),
            riskAlerts: riskAlerts.map(alert => ({
                id: alert.id,
                workspaceName: alert.workspace.name,
                status: alert.health_status,
                reason: alert.integration_status,
                phone: alert.phone_number
            }))
        });

    } catch (e) {
        console.error("Super Admin Stats Error", e);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
