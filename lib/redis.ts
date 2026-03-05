
import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || '6379'}`;

const globalForRedis = global as unknown as { redis: Redis };

export const redis = globalForRedis.redis || new Redis(REDIS_URL, {
    maxRetriesPerRequest: null,
});

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;
