import { campaignQueue } from "../lib/queue";

async function main() {
    console.log("🔍 Fetching completed jobs from Campaign Queue...");
    const completedJobs = await campaignQueue.getCompleted();
    console.log(`Found ${completedJobs.length} completed jobs.`);
    
    for (const job of completedJobs) {
        console.log(`Job ID: ${job.id}`);
        console.log(`Job Name: ${job.name}`);
        console.log(`Job Data:`, JSON.stringify(job.data, null, 2));
        console.log("-----------------------------------------");
    }
}

main().catch(console.error).finally(() => campaignQueue.close());
