import { prisma } from "../lib/db";
import { campaignQueue } from "../lib/queue";

async function main() {
    const campaignId = "92ce1079-0b44-4efb-97a5-0a03c1a23399";
    console.log(`♻️ Retrying campaign: ${campaignId}`);

    // 1. Reset campaign in database
    await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: "PROCESSING" }
    });

    await prisma.campaignStats.update({
        where: { campaign_id: campaignId },
        data: { sent: 0, failed: 0 }
    });

    console.log("✅ Campaign status reset in database.");

    // 2. Remove old job if exists in BullMQ
    const oldJob = await campaignQueue.getJob(`UNROLL-${campaignId}`);
    if (oldJob) {
        await oldJob.remove();
        console.log("✅ Removed old unroll job from queue.");
    }

    // 3. Add to campaign-queue to run immediately
    await campaignQueue.add(
        "send-campaign",
        {
            campaignId: campaignId,
            workspaceId: "89b6c788-d842-4bf6-8af9-bc02e84e76d2",
            segmentId: "509e8522-bd8e-4427-8327-22052b1dd2d4"
        },
        {
            jobId: `UNROLL-${campaignId}`
        }
    );

    console.log("🚀 Enqueued send-campaign job successfully!");
}

main().catch(console.error).finally(() => prisma.$disconnect());
