import Redis from "ioredis";

const getRedisConfig = () => {
    if (process.env.REDIS_URL) {
        return process.env.REDIS_URL;
    }
    return {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
    };
};

// Singleton Redis Client for Status Caching
let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
    if (!redisClient) {
        redisClient = new Redis(getRedisConfig() as any);
    }
    return redisClient;
}

/**
 * 🛰️ CAMPAIGN STATUS CACHE
 * Allows workers to instantly check campaign state without DB thrashing
 */
export const CampaignStatusCache = {
    async set(campaignId: string, status: string) {
        const client = getRedisClient();
        await client.set(`campaign:status:${campaignId}`, status, "EX", 60 * 60 * 24); // 24h expiration
    },

    async get(campaignId: string): Promise<string | null> {
        const client = getRedisClient();
        return await client.get(`campaign:status:${campaignId}`);
    },

    async delete(campaignId: string) {
        const client = getRedisClient();
        await client.del(`campaign:status:${campaignId}`);
    },

    /**
     * 😵 CONTACT FATIGUE (Frequency Capping)
     * Tracks when a contact last received a marketing message
     */
    async trackFatigue(contactId: string, windowHours: number = 24) {
        const client = getRedisClient();
        await client.set(`fatigue:contact:${contactId}`, Date.now().toString(), "EX", 60 * 60 * windowHours);
    },

    async isFatigued(contactId: string): Promise<boolean> {
        const client = getRedisClient();
        const exists = await client.exists(`fatigue:contact:${contactId}`);
        return exists === 1;
    }
};

/**
 * 🚦 RATE LIMITER (SLIDING WINDOW)
 */
export const RateLimiter = {
    async isAllowed(key: string, limit: number, windowSeconds: number): Promise<boolean> {
        const client = getRedisClient();
        const now = Date.now();
        const windowStart = now - (windowSeconds * 1000);

        const multi = client.multi();
        multi.zremrangebyscore(key, 0, windowStart);
        multi.zadd(key, now, `${now}-${Math.random()}`);
        multi.zcard(key);
        multi.expire(key, windowSeconds + 10);

        const results = await multi.exec();
        if (!results) return true;
        
        const count = results[2][1] as number;
        return count <= limit;
    }
};
