import { Queue } from "bullmq";

const REDIS_CONNECTION = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
};

// Singleton Queue Instance
export const campaignQueue = new Queue("campaign-queue", {
    connection: REDIS_CONNECTION,
    defaultJobOptions: {
        attempts: 3,
        backoff: { type: "exponential", delay: 1000 },
        removeOnComplete: true,
    },
});

export const automationQueue = new Queue("automation-queue", {
    connection: REDIS_CONNECTION,
    defaultJobOptions: {
        attempts: 5,
        backoff: { type: "fixed", delay: 5000 },
        removeOnComplete: true,
    },
});
