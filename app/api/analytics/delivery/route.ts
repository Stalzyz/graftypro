import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const startRaw = searchParams.get('start');
        const endRaw = searchParams.get('end');

        // Default to last 30 days
        const endDate = endRaw ? new Date(endRaw) : new Date();
        const startDate = startRaw ? new Date(startRaw) : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000);

        // 1. Fetch Key Stats
        const totalMessages = await prisma.message.count({
            where: {
                workspace_id: user.workspaceId,
                created_at: { gte: startDate, lte: endDate }
            }
        });

        const deliveredMessages = await prisma.message.count({
            where: {
                workspace_id: user.workspaceId,
                created_at: { gte: startDate, lte: endDate },
                status: "DELIVERED"
            }
        });

        const failedMessages = await prisma.message.count({
            where: {
                workspace_id: user.workspaceId,
                created_at: { gte: startDate, lte: endDate },
                status: "FAILED"
            }
        });

        const sentMessages = await prisma.message.count({
            where: {
                workspace_id: user.workspaceId,
                created_at: { gte: startDate, lte: endDate },
                status: "SENT"
            }
        });

        const readMessages = await prisma.message.count({
            where: {
                workspace_id: user.workspaceId,
                created_at: { gte: startDate, lte: endDate },
                status: "READ"
            }
        });

        // 2. Fetch Template Performance
        const templatesData = await prisma.message.groupBy({
            by: ['template_name'],
            where: {
                workspace_id: user.workspaceId,
                created_at: { gte: startDate, lte: endDate },
                template_name: { not: null }
            },
            _count: {
                id: true
            }
        });

        // For each template we need to know the breakdown (this is N queries for now, but N is usually small)
        const templatePerformance = [];
        for (const t of templatesData) {
            if (!t.template_name) continue;

            const breakdown = await prisma.message.groupBy({
                by: ['status'],
                where: {
                    workspace_id: user.workspaceId,
                    created_at: { gte: startDate, lte: endDate },
                    template_name: t.template_name
                },
                _count: { id: true }
            });

            let tSent = 0, tDelivered = 0, tFailed = 0;
            breakdown.forEach(b => {
                if (b.status === "SENT") tSent = b._count.id;
                if (b.status === "DELIVERED") tDelivered = b._count.id;
                if (b.status === "FAILED") tFailed = b._count.id;
            });

            const total = tSent + tDelivered + tFailed;
            templatePerformance.push({
                name: t.template_name,
                total,
                sent: tSent,
                delivered: tDelivered,
                failed: tFailed,
                deliveryRate: total > 0 ? ((tDelivered / total) * 100).toFixed(1) : 0
            });
        }

        // 3. Recently Failed Logs
        const recentFailures = await prisma.message.findMany({
            where: {
                workspace_id: user.workspaceId,
                status: "FAILED",
            },
            include: {
                contact: { select: { phone: true, name: true } }
            },
            orderBy: { created_at: 'desc' },
            take: 20
        });

        // Format Failures
        const formattedFailures = recentFailures.map(f => ({
            id: f.id,
            time: f.failed_at || f.created_at,
            phone: f.contact.phone || "Unknown",
            template: f.template_name || "Regular Message",
            error: f.error_message || "Unknown Meta Error",
            code: f.error_code || "N/A"
        }));

        // Compute Delivery Rates
        const attemptTotal = sentMessages + deliveredMessages + readMessages + failedMessages;
        const successRate = attemptTotal > 0 ? (((deliveredMessages + readMessages) / attemptTotal) * 100).toFixed(1) : 0;
        const failureRate = attemptTotal > 0 ? ((failedMessages / attemptTotal) * 100).toFixed(1) : 0;

        return NextResponse.json({
            overview: {
                totalAttempts: attemptTotal,
                delivered: deliveredMessages + readMessages,
                failed: failedMessages,
                successRate,
                failureRate
            },
            templates: templatePerformance.sort((a, b) => b.total - a.total),
            recentFailures: formattedFailures
        });

    } catch (e) {
        console.error("Delivery Intelligence API Error", e);
        return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
    }
}
