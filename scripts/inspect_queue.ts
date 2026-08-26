import { metaApiQueue, campaignQueue } from "../lib/queue";

async function main() {
    console.log("🔍 Checking BullMQ Queues status...");
    
    const metaJobsCount = await metaApiQueue.getJobCounts();
    console.log("Meta API Queue counts:", JSON.stringify(metaJobsCount, null, 2));

    const campaignJobsCount = await campaignQueue.getJobCounts();
    console.log("Campaign Queue counts:", JSON.stringify(campaignJobsCount, null, 2));

    const waitingJobs = await metaApiQueue.getWaiting();
    console.log(`Waiting jobs count: ${waitingJobs.length}`);
    if (waitingJobs.length > 0) {
        console.log("First waiting job:", JSON.stringify({
            id: waitingJobs[0].id,
            name: waitingJobs[0].name,
            data: waitingJobs[0].data
        }, null, 2));
    }

    const activeJobs = await metaApiQueue.getActive();
    console.log(`Active jobs count: ${activeJobs.length}`);
}

main().catch(console.error).finally(() => {
    metaApiQueue.close();
    campaignQueue.close();
});
