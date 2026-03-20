
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`;

const globalForRedis = global as unknown as { redis: Redis };

export const redis = globalForRedis.redis || new Redis(REDIS_URL, {
    maxRetriesPerRequest: 1, // Fail fast if Redis is down
    connectTimeout: 5000,     // 5 second timeout
});

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
