import { Worker } from "bullmq";
import { prisma } from "../lib/db";
import { WhatsAppService } from "../lib/whatsapp/service";

const REDIS_CONNECTION = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
};

console.log("🚀 Campaign Worker Starting...");

const worker = new Worker(
    "campaign-queue",
    async (job) => {
        console.log(`Processing Campaign Job: ${job.id}`);
        const { campaignId, workspaceId } = job.data;

        // 1. Fetch Campaign & Details
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
            include: { workspace: true }
        });

        if (!campaign) throw new Error("Campaign not found");
        if (campaign.status !== "PROCESSING") return;

        // 2. Fetch WABA Creds
        const waba = await prisma.whatsAppAccount.findUnique({
            where: { workspace_id: workspaceId }
        });

        if (!waba) throw new Error("No WhatsApp Account linked");

        // 3. Fetch Audience (Contacts matching filters)
        // Respecting Consent Engine (Phase 2)
        const contacts = await prisma.contact.findMany({
            where: {
                workspace_id: workspaceId,
                opt_in: true,
                blocked: false
            }
        });

        console.log(`Audience Size: ${contacts.length}`);

        // Track Stats
        let sent = 0;
        let failed = 0;

        // 4. Send Loop (Batching is recommended in Prod)
        for (const contact of contacts) {
            try {
                await WhatsAppService.sendTemplate(
                    waba.phone_number_id,
                    waba.access_token,
                    contact.phone,
                    campaign.template_name || "hello_world", // fallback
                    "en"
                );
                sent++;
            } catch (e) {
                console.error(`Failed to send to ${contact.phone}`, e);
                failed++;
            }

            // Update progress every 10 messages
            if (sent % 10 === 0) {
                await job.updateProgress((sent / contacts.length) * 100);
            }
        }

        // 5. Finalize
        await prisma.campaign.update({
            where: { id: campaignId },
            data: { status: "COMPLETED" }
        });

        await prisma.campaignStats.upsert({
            where: { campaign_id: campaignId },
            update: {
                total: contacts.length,
                sent: sent,
                failed: failed
            },
            create: {
                campaign_id: campaignId,
                total: contacts.length,
                sent: sent,
                failed: failed
            }
        });

        console.log(`Campaign ${campaignId} Finished. Sent: ${sent}, Failed: ${failed}`);
    },
    {
        connection: REDIS_CONNECTION,
        concurrency: 5, // Send 5 at a time
    }
);

worker.on("completed", (job) => {
    console.log(`Job ${job.id} completed!`);
});

worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} failed:`, err);
});
