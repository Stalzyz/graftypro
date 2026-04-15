import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function repairStats() {
    console.log("🛠️ Starting Campaign Stats Repair...");

    const campaigns = await prisma.campaign.findMany({
        where: {
            OR: [
                { status: "COMPLETED" },
                { status: "PROCESSING" }
            ]
        },
        include: { stats: true }
    });

    for (const campaign of campaigns) {
        console.log(`Processing Campaign: ${campaign.name} (${campaign.id})`);

        // Count actual messages in DB
        const sentCount = await (prisma as any).message.count({
            where: { campaign_id: campaign.id, status: { in: ["SENT", "DELIVERED", "READ"] } }
        });

        const deliveredCount = await (prisma as any).message.count({
            where: { campaign_id: campaign.id, status: { in: ["DELIVERED", "READ"] } }
        });

        const readCount = await (prisma as any).message.count({
            where: { campaign_id: campaign.id, status: "READ" }
        });

        const failedCount = await (prisma as any).message.count({
            where: { campaign_id: campaign.id, status: "FAILED" }
        });

        // ☢️ Ensure Stats record exists
        await prisma.campaignStats.upsert({
            where: { campaign_id: campaign.id },
            create: {
                campaign_id: campaign.id,
                total: (campaign.stats as any)?.total || 0,
                sent: sentCount,
                delivered: deliveredCount,
                read: readCount,
                failed: failedCount
            },
            update: {
                sent: sentCount,
                delivered: deliveredCount,
                read: readCount,
                failed: failedCount
            }
        });

        console.log(`✅ Fixed Stats for ${campaign.name}: ${sentCount} Sent, ${failedCount} Failed.`);
    }

    console.log("🏁 Repair Complete.");
}

repairStats()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
