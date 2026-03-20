
import { prisma } from "../db";
import { Redis } from "ioredis";

export class HealthUtils {
    static async getSystemStatus() {
        const stats: any = {
            timestamp: new Date().toISOString(),
            database: "UP",
            redis: "DOWN",
            queues: {}
        };

        try {
            await prisma.$queryRaw`SELECT 1`;
        } catch (e) {
            stats.database = "DOWN";
        }

        try {
            const redis = new Redis(process.env.REDIS_URL || "");
            const pong = await redis.ping();
            if (pong === "PONG") stats.redis = "UP";
            await redis.quit();
        } catch (e) {
            // Ignored
        }

        // Queue Depths (Mocking for now as we'd need to import queue definitions)
        return stats;
    }

    static async getRecentRiskEvents() {
        return await prisma.resellerRiskLog.findMany({
            take: 10,
            orderBy: { created_at: 'desc' },
            include: { reseller: { select: { brand_name: true } } }
        });
    }
}
