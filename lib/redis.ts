
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`;

const globalForRedis = global as unknown as { redis: Redis };

// CRITICAL FIX: Removed lazyConnect:true — it kept Redis in 'wait' state
// causing ALL flow lock acquisitions to throw "Stream isn't writeable",
// silently discarding every incoming WhatsApp message.
export const redis = globalForRedis.redis || new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1,  // Fail fast if Redis is down
    connectTimeout: 5000,     // 5 second connection timeout
    enableOfflineQueue: false, // Fail-fast when Redis temporarily disconnects
    retryStrategy: (times) => {
        if (times > 3) return null; // Stop retrying after 3 attempts
        return Math.min(times * 200, 1000); // Exponential backoff: 200ms, 400ms, 600ms
    },
});

redis.on("error", (err) => {
    // Log but don't crash on Redis errors — session-manager handles this gracefully
    console.error('[Redis] Connection error:', err.message);
});

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
