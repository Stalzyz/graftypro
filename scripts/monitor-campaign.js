
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const campaignId = process.argv[2];
    if (!campaignId) {
        console.error("Usage: node scripts/monitor-campaign.js <campaignId>");
        process.exit(1);
    }

    console.log(`📡 Monitoring Campaign: ${campaignId}`);

    let lastSent = 0;
    const start = Date.now();

    const interval = setInterval(async () => {
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { stats: true }
        });

        if (!campaign) {
            console.log("❌ Campaign not found");
            clearInterval(interval);
            return;
        }

        const stats = campaign.stats || { sent: 0, failed: 0, total: 0 };
        const elapsed = (Date.now() - start) / 1000;
        const rate = (stats.sent - lastSent) / 2; // per 2 seconds
        lastSent = stats.sent;

        process.stdout.write(`\r[${elapsed.toFixed(0)}s] Status: ${campaign.status} | Sent: ${stats.sent}/${stats.total} | Failed: ${stats.failed} | Speed: ${rate.toFixed(1)} msg/s`);

        if (campaign.status === 'COMPLETED' || campaign.status === 'FAILED') {
            console.log("\n✅ Campaign Finished.");
            clearInterval(interval);
            process.exit(0);
        }
    }, 2000);
}

main();
