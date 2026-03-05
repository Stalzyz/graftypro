import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    const user = await getCurrentUser(req);
    if (!user || user.role !== "SUPER_ADMIN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Real Node.js process stats
        const mem = process.memoryUsage();
        const uptimeSeconds = process.uptime();

        const days = Math.floor(uptimeSeconds / 86400);
        const hours = Math.floor((uptimeSeconds % 86400) / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const uptimeFormatted = `${days}d ${hours}h ${minutes}m`;

        const usedMB = Math.round(mem.heapUsed / 1024 / 1024);
        const totalMB = Math.round(mem.heapTotal / 1024 / 1024);
        const rssGB = (mem.rss / 1024 / 1024 / 1024).toFixed(2);

        // DB stats - count active workspaces as a proxy for active connections
        const [workspaceCount, messageCount] = await Promise.all([
            prisma.workspace.count({ where: { status: "ACTIVE" } }),
            prisma.message.count({
                where: {
                    created_at: {
                        gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                }
            })
        ]);

        return NextResponse.json({
            uptime: uptimeFormatted,
            memory: {
                used_mb: usedMB,
                total_mb: totalMB,
                rss_gb: rssGB,
                formatted: `${usedMB} MB / ${totalMB} MB`
            },
            cpu: "—", // CPU % requires native modules; not available in pure Node
            db: {
                active_workspaces: workspaceCount,
                messages_24h: messageCount,
            },
            node_version: process.version,
            platform: process.platform,
            env: process.env.NODE_ENV || "production"
        });
    } catch (error: any) {
        console.error("Infra stats error:", error);
        return NextResponse.json({ error: "Failed to fetch infra stats" }, { status: 500 });
    }
}
