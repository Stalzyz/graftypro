
import { redis } from "../redis";

export class RateLimiter {
    /**
     * Check if a key (IP or Email) has exceeded rate limits
     * @returns {Promise<boolean>} - true if restricted, false if allowed
     */
    static async isRestricted(key: string, limit: number, durationSeconds: number): Promise<boolean> {
        try {
            const fullKey = `rate_limit:${key}`;
            const current = await redis.get(fullKey);

            if (current && parseInt(current) >= limit) {
                return true;
            }

            const pipeline = redis.pipeline();
            pipeline.incr(fullKey);
            if (!current) {
                pipeline.expire(fullKey, durationSeconds);
            }
            await pipeline.exec();

            return false;
        } catch (error) {
            console.error("RateLimiter Redis Error:", error);
            return false; // Fail open - allow if Redis is down
        }
    }

    /**
     * Get remaining wait time in seconds for a restricted key
     */
    static async getWaitTime(key: string): Promise<number> {
        const ttl = await redis.ttl(`rate_limit:${key}`);
        return ttl > 0 ? ttl : 0;
    }
}
