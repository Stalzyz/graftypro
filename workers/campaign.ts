
import { Worker } from "bullmq";
import { prisma } from "../lib/db";
import { WhatsAppService } from "../lib/whatsapp/service";
import { decrypt } from "../lib/security/encryption";

const REDIS_CONNECTION = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
};

console.log("🚀 Campaign Worker Starting...");

const worker = new Worker(
    "campaign-queue",
    async (job) => {
        console.log(`Processing Campaign Job: ${job.id}`);
        const { campaignId, workspaceId, segmentId } = job.data;

        // 1. Fetch Campaign
        const campaign = await prisma.campaign.findUnique({
            where: { id: campaignId },
        });

        if (!campaign) throw new Error("Campaign not found");

        // 2. Fetch WABA Creds
        const waba = await prisma.whatsAppAccount.findUnique({
            where: { workspace_id: workspaceId }
        });

        if (!waba) throw new Error("No WhatsApp Account linked");

        // 3. Fetch Template Details
        const template = await prisma.template.findFirst({
            where: {
                workspace_id: workspaceId,
                name: campaign.template_name || ""
            },
            include: { variables: true }
        });

        const langCode = template?.language || "en_US";

        // 4. Build Audience Query
        let contactWhere: any = {
            workspace_id: workspaceId,
            opt_in: true,
            blocked: false
        };

        // If segment provided, apply filters
        if (segmentId) {
            const segment = await prisma.segment.findUnique({
                where: { id: segmentId }
            });
            if (segment && (segment.filters as any).tags) {
                contactWhere.tags = {
                    hasSome: (segment.filters as any).tags
                };
            }
        }

        const contacts = await prisma.contact.findMany({
            where: contactWhere
        });

        console.log(`Targeting Segment ${segmentId || 'ALL'}. Audience Size: ${contacts.length}`);

        // Track Stats
        let sent = 0;
        let failed = 0;

        // 5. Send Loop
        for (const contact of contacts) {
            try {
                // --- ENTERPRISE CREDIT SYSTEM (Phase 3) ---
                const { CreditService } = await import("../lib/credits/service");
                const countryCode = contact.phone.replace(/[^0-9]/g, "").substring(0, 2);
                const category = campaign.template_name ? "MARKETING" : "SERVICE";
                const cost = await CreditService.getMessageCost(category, countryCode);

                await prisma.$transaction(async (tx) => {
                    await CreditService.deductCredits(
                        tx,
                        workspaceId,
                        cost,
                        `CAMPAIGN-${campaignId}-${contact.id}`,
                        `Campaign Send: ${campaign.name}`
                    );
                });

                if (campaign.flow_id) {
                    const { FlowRunner } = await import("../lib/engine/flow-runner");
                    // Start a new session for this flow
                    const session = await prisma.flowSession.create({
                        data: {
                            flow_id: campaign.flow_id,
                            contact_id: contact.id,
                            current_node_id: null,
                            state: { is_campaign: true, campaign_id: campaignId },
                        },
                        include: { flow: true },
                    });
                    // Execute first node
                    // @ts-ignore
                    await FlowRunner.executeNextStep(session, null);
                    sent++;
                } else if (campaign.template_name) {
                    const components: any[] = [];
                    if (template && template.variables.length > 0) {
                        const parameters = template.variables
                            .sort((a, b) => a.param_index - b.param_index)
                            .map(v => {
                                let value = v.sample_value;
                                if (v.param_index === 1 && contact.name) value = contact.name;
                                return { type: "text", text: value };
                            });

                        components.push({
                            type: "body",
                            parameters: parameters
                        });
                    }

                    await WhatsAppService.sendTemplate(
                        waba.phone_number_id,
                        decrypt(waba.access_token),
                        contact.phone,
                        campaign.template_name,
                        langCode,
                        components
                    );
                    sent++;
                }
            } catch (e) {
                console.error(`Failed to send to ${contact.phone}`, e);
                failed++;
            }
            if (sent % 10 === 0) await job.updateProgress((sent / contacts.length) * 100);
        }

        // 6. Finalize
        await prisma.campaign.update({
            where: { id: campaignId },
            data: { status: "COMPLETED" }
        });

        await prisma.campaignStats.upsert({
            where: { campaign_id: campaignId },
            update: { total: contacts.length, sent, failed },
            create: { campaign_id: campaignId, total: contacts.length, sent, failed }
        });

    },
    {
        connection: REDIS_CONNECTION,
        concurrency: 10,
    }
);
