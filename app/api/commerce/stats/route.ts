
import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 1. Get aggregate stats for the workspace
        const [orderStats, productCount, activeOrders] = await Promise.all([
            prisma.commerceOrder.aggregate({
                where: { store: { workspace_id: user.workspaceId } },
                _sum: { total_amount: true },
                _count: { id: true }
            }),
            prisma.commerceProduct.count({
                where: { store: { workspace_id: user.workspaceId } }
            }),
            prisma.commerceOrder.count({
                where: { 
                    store: { workspace_id: user.workspaceId },
                    status: { in: ["PLACED", "PAID", "SHIPPED"] } 
                }
            })
        ]);

        // 2. Get recent activity (last 5 orders)
        const recentActivity = await prisma.commerceOrder.findMany({
            where: { store: { workspace_id: user.workspaceId } },
            orderBy: { created_at: "desc" },
            take: 5,
            include: {
                contact: {
                    select: { name: true, phone: true }
                }
            }
        });

        // 3. Get Store Sync Health
        const stores = await prisma.commerceStore.findMany({
            where: { workspace_id: user.workspaceId },
            select: { last_sync_at: true, platform: true }
        });

        let syncStatus = "No Stores";
        if (stores.length > 0) {
            const externalStores = stores.filter(s => s.platform !== "NATIVE");
            if (externalStores.length === 0) {
                syncStatus = "Native Active";
            } else {
                const allSyncedRecently = externalStores.every(s => 
                    s.last_sync_at && (new Date().getTime() - new Date(s.last_sync_at).getTime() < 24 * 60 * 60 * 1000)
                );
                syncStatus = allSyncedRecently ? "Healthy" : "Attention Needed";
            }
        }

        // 4. Abandoned Checkout Stats (PLACED but not PAID within 1 hour, and not COD)
        const ONE_HOUR_AGO = new Date(Date.now() - 60 * 60 * 1000);
        const abandonedCount = await prisma.commerceOrder.count({
            where: {
                store: { workspace_id: user.workspaceId },
                status: "PLACED",
                payment_status: "PENDING",
                payment_method: { not: "COD" },
                created_at: { lt: ONE_HOUR_AGO }
            }
        });

        const totalRevenue = orderStats._sum.total_amount ? Number(orderStats._sum.total_amount) : 0;

        return NextResponse.json({
            success: true,
            stats: {
                totalRevenue: `₹${totalRevenue.toLocaleString()}`,
                activeOrders: activeOrders.toString(),
                totalProducts: productCount.toString(),
                totalOrders: orderStats._count.id.toString(),
                syncStatus: syncStatus,
                abandonedCheckouts: abandonedCount.toString()
            },
            recentActivity: recentActivity.map((order: any) => ({
                id: order.id,
                customer: order.contact?.name || order.contact?.phone || "Unknown Customer",
                amount: `₹${Number(order.total_amount).toLocaleString()}`,
                status: order.status,
                time: order.created_at
            }))
        });

    } catch (error: any) {
        console.error("Commerce Stats Error:", error);
        return NextResponse.json({ error: "Failed to fetch commerce intelligence" }, { status: 500 });
    }
}
