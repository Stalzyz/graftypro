import { Queue } from "bullmq";
import Redis from "ioredis";

const redis = new Redis({ host: "localhost", port: 6379 });
const campaignQueue = new Queue("campaign-queue", { connection: redis });

async function run() {
    const campaignId = "91f09f62-8bd5-4c9d-8fd3-fb2af015410f";
    const workspaceId = "89b6c788-d842-4bf6-8af9-bc02e84e76d2";
    await campaignQueue.add(
        "send-campaign",
        {
            campaignId: campaignId,
            workspaceId: workspaceId,
            segmentId: null
        },
        {
            jobId: `UNROLL-${campaignId}`,
            attempts: 3,
            backoff: { type: "exponential", delay: 5000 }
        }
    );
    console.log("Job enqueued manually.");
    process.exit(0);
}
run();
