import { Queue } from "bullmq";

const getRedisConfig = () => {
    if (process.env.REDIS_URL) {
        try {
            const url = new URL(process.env.REDIS_URL);
            return {
                host: url.hostname,
                port: parseInt(url.port || "6379"),
            };
        } catch (e) {
            console.error("Invalid REDIS_URL:", e);
        }
    }
    return {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
    };
};

const REDIS_CONNECTION = getRedisConfig();

console.log("🔌 [Queue] Redis Config:", typeof REDIS_CONNECTION === 'string' ? REDIS_CONNECTION : JSON.stringify(REDIS_CONNECTION));

/**
 * Lazy Queue Initializer
 * Prevents connection attempts during Next.js build phase
 */
const createQueue = (name: string) => {
    // If we're in the build phase, return a proxy or null-ish object
    if (process.env.NEXT_PHASE === 'phase-production-build') {
        return null as unknown as Queue;
    }

    return new Queue(name, {
        connection: typeof REDIS_CONNECTION === 'string' ? REDIS_CONNECTION : REDIS_CONNECTION as any,
        defaultJobOptions: {
            attempts: 3,
            backoff: { type: "exponential", delay: 1000 },
            removeOnComplete: true,
        },
    });
};

export const campaignQueue = createQueue("campaign-queue");
export const automationQueue = createQueue("automation-queue");
