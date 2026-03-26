
import { Worker } from "bullmq";
import { prisma } from "@/lib/db";
import { WhatsAppService } from "@/lib/whatsapp/service";
import { FlowRunner } from "@/lib/engine/flow-runner";
import { CreditService } from "@/lib/credits/service";
import { decrypt, maskToken } from "@/lib/security/encryption";
import { WhatsAppMediaDownloader } from "@/lib/whatsapp/media-downloader";
import { normalizeMessage } from "@/lib/engine/message-normalizer";
import { PRIORITY_HIGH, PRIORITY_LOW } from "@/lib/queue";

// --- CONFIG ---
const REDIS_CONNECTION = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
};

// --- STARTUP CONNECTIVITY TEST & HEALTH MONITORING ---
(async () => {
    console.log("🚀 [Worker] Starting up...");
    console.log("🔗 [Worker] Testing Database Connection...");
    try {
        await prisma.$connect();
        console.log("✅ [Worker] Database Connected successfully.");

        // Initialize Repeatable Jobs
        const { dripDispatchQueue, automationQueue } = await import("@/lib/queue");
        if (dripDispatchQueue) {
            await dripDispatchQueue.add("drip-pulse", {}, { repeat: { every: 60000 } });
            console.log("⏱️ [Worker] Drip Pulse scheduled (Every 60s)");
        }

        if (automationQueue) {
            await automationQueue.add("nightly-reconciliation", {}, {
                repeat: { pattern: "0 2 * * *" } // Run at 2 AM every night
            });
            console.log("🌙 [Worker] Nightly Reconciliation scheduled (2 AM)");
        }

        // Start Global Health Monitor
        const { HealthMonitorService } = await import("@/lib/whatsapp/health-monitor");
        console.log("🩺 [Worker] Initializing Connection Health Monitor...");
        HealthMonitorService.runGlobalHealthCheck().catch(console.error);

        setInterval(() => {
            HealthMonitorService.runGlobalHealthCheck().catch(console.error);
        }, 6 * 60 * 60 * 1000);

    } catch (err) {
        console.error("❌ [Worker] CRITICAL: DB connection failed!", err);
    }
})();

// ---------------------------------------------------------
// 1. META API WORKER (Prioritized Outbound Layer)
// ---------------------------------------------------------
const metaApiWorker = new Worker(
    "meta-api-queue",
    async (job) => {
        const { type, payload } = job.data;
        console.log(`[MetaAPIWorker] 📡 Processing ${type} for ${payload.to} (Priority: ${job.opts.priority || 'DEFAULT'})`);

        const { phoneNumberId, accessToken, to } = payload;

        try {
            const workspaceId = payload.workspaceId;
            const campaignId = payload.campaignId;
            const category = type === "SEND_TEMPLATE" ? "MARKETING" : "SERVICE";

            let result;
            switch (type) {
                case "SEND_TEMPLATE":
                    result = await WhatsAppService.sendTemplate(
                        phoneNumberId,
                        accessToken,
                        to,
                        payload.templateName,
                        payload.langCode || "en_US",
                        payload.components || [],
                        workspaceId,
                        category
                    );
                    break;
                case "SEND_TEXT":
                    result = await WhatsAppService.sendText(
                        phoneNumberId,
                        accessToken,
                        to,
                        payload.body,
                        workspaceId,
                        category
                    );
                    break;
                case "SEND_MEDIA":
                    const mediaType = payload.mediaType;
                    if (mediaType === "IMAGE") result = await WhatsAppService.sendImage(phoneNumberId, accessToken, to, payload.url, payload.caption, workspaceId, category);
                    else if (mediaType === "VIDEO") result = await WhatsAppService.sendVideo(phoneNumberId, accessToken, to, payload.url, payload.caption, workspaceId, category);
                    else if (mediaType === "DOCUMENT") result = await WhatsAppService.sendDocument(phoneNumberId, accessToken, to, payload.url, payload.filename, workspaceId, category);
                    else if (mediaType === "AUDIO") result = await WhatsAppService.sendVoice(phoneNumberId, accessToken, to, payload.url, workspaceId, category);
                    break;
                case "SEND_INTERACTIVE":
                case "SEND_GENERIC":
                    // Use the generic sendMessage for complex structures (Flows, Buttons, etc.)
                    result = await WhatsAppService.sendMessage(phoneNumberId, accessToken, payload, workspaceId, category);
                    break;
                case "START_FLOW":
                    result = await FlowRunner.startFlow(workspaceId, payload.contactId, payload.flowId);
                    break;
                default:
                    console.warn(`[MetaAPIWorker] Unknown job type: ${type}`);
            }

            // 📈 Real-time Progress Tracking
            if (campaignId && result) {
                await prisma.campaignStats.update({
                    where: { campaign_id: campaignId },
                    data: { sent: { increment: 1 } }
                }).catch(e => console.error(`[MetaAPIWorker] Failed to update stats for ${campaignId}`, e.message));
            }

            return result;
        } catch (err: any) {
            console.error(`[MetaAPIWorker] ❌ Failed to process ${type}:`, err.response?.data || err.message);
            throw err; // Trigger BullMQ retry
        }
    },
    { 
        connection: REDIS_CONNECTION,
        limiter: { max: 80, duration: 1000 }, // Global Throttling for Meta API
        concurrency: 20
    }
);

// ---------------------------------------------------------
// 2. CAMPAIGN DISPATCHER (The Unroller)
// ---------------------------------------------------------
const campaignWorker = new Worker(
    "campaign-queue",
    async (job) => {
        const { campaignId, workspaceId, segmentId, targetStatus, course } = job.data;
        const { metaApiQueue } = await import("@/lib/queue");

        console.log(`[CampaignWorker] 🚀 Unrolling Campaign: ${campaignId}`);

        try {
            const campaign = await prisma.campaign.findUnique({ 
                where: { id: campaignId },
                include: { workspace: { include: { waba: true } } }
            });
            
            if (!campaign || !campaign.workspace?.waba) {
                console.error(`[CampaignWorker] Campaign or WABA not found for ID: ${campaignId}`);
                return;
            }

            const waba = campaign.workspace.waba;
            const decryptedToken = decrypt(waba.access_token);

            // Fetch Audience
            let recipients: { phone: string, name: string, id: string }[] = [];

            if (job.name === "edu-bulk-broadcast") {
                // @ts-ignore
                const leads = await prisma.eduLead.findMany({
                    where: {
                        workspace_id: workspaceId,
                        ...(targetStatus && targetStatus.length > 0 ? { status: { in: targetStatus } } : {}),
                        ...(course ? { course_interested: course } : {})
                    }
                });
                recipients = leads.map(l => ({ phone: l.whatsapp_number, name: l.student_name, id: l.id }));
            } else {
                let contacts: any[] = [];
                if (segmentId) {
                    const segment = await prisma.segment.findUnique({ where: { id: segmentId } });
                    if (segment) {
                        const { CommerceSegmentation } = await import("@/lib/commerce/segmentation");
                        contacts = await CommerceSegmentation.getSegmentContacts(workspaceId, segment.filters);
                    } else {
                        contacts = await prisma.contact.findMany({ where: { workspace_id: workspaceId, blocked: false } });
                    }
                } else {
                    contacts = await prisma.contact.findMany({ where: { workspace_id: workspaceId, blocked: false, opt_in: true } });
                }
                recipients = contacts.map(c => ({ phone: c.phone, name: c.name || "Customer", id: c.id }));
            }

            console.log(`[CampaignWorker] Audience fetched. Size: ${recipients.length}`);

            // Update stats to PROCESSING
            await prisma.campaign.update({
                where: { id: campaignId },
                data: {
                    status: "PROCESSING",
                    stats: {
                        upsert: { create: { total: recipients.length }, update: { total: recipients.length } }
                    }
                }
            });

            // 🎯 MONSTER OPTIMIZATION: Dispatch with Bulk Add
            const batchSize = 100;
            for (let i = 0; i < recipients.length; i += batchSize) {
                const batch = recipients.slice(i, i + batchSize);
                
                const jobs = batch.map(person => {
                    const countryCode = person.phone.replace(/[^0-9]/g, "").substring(0, 2) || "91";
                    
                    // Construct individual job
                    return {
                        name: campaign.flow_id ? "start-flow" : "send-template",
                        data: {
                            type: campaign.flow_id ? "START_FLOW" : "SEND_TEMPLATE",
                            payload: {
                                campaignId,
                                workspaceId,
                                contactId: person.id,
                                flowId: campaign.flow_id,
                                phoneNumberId: waba.phone_number_id,
                                accessToken: decryptedToken,
                                to: person.phone,
                                templateName: campaign.template_name,
                                // Variables mapping (Expert Logic)
                                components: campaign.template_name ? [{
                                    type: "body",
                                    parameters: [{ type: "text", text: person.name || "Customer" }]
                                }] : []
                            }
                        },
                        opts: { 
                            priority: PRIORITY_LOW, 
                            jobId: `CAMP-${campaignId}-${person.id}` // Deduplication per campaign
                        }
                    };
                });

                await metaApiQueue!.addBulk(jobs);
                console.log(`[CampaignWorker] Dispatched batch ${i / batchSize + 1} (${batch.length} jobs)`);
                
                // Update progress in job
                await job.updateProgress((i / recipients.length) * 100);
            }

            await prisma.campaign.update({
                where: { id: campaignId },
                data: { status: "COMPLETED" }
            });

            console.log(`[CampaignWorker] ✅ Unrolling complete for Campaign: ${campaignId}`);

        } catch (error: any) {
            console.error(`[CampaignWorker] ❌ Fatal Error during unrolling:`, error.message);
            throw error;
        }
    },
    { connection: REDIS_CONNECTION }
);

// ---------------------------------------------------------
// 3. DRIP DISPATCHER (Repeatable Pulse)
// ---------------------------------------------------------
const dripDispatchWorker = new Worker(
    "drip-dispatch-queue",
    async (job) => {
        console.log(`[Drip Dispatcher] Executing Pulse: ${job.id}`);
        const { metaApiQueue } = await import("@/lib/queue");

        const dueEnrollments = await prisma.dripEnrollment.findMany({
            where: { is_stopped: false, next_run_at: { lte: new Date() } },
            include: {
                drip: { include: { steps: { orderBy: { step_order: 'asc' } } } },
                contact: { include: { workspace: { include: { waba: true } } } }
            },
            take: 100
        });

        for (const enrollment of dueEnrollments) {
            const step = enrollment.drip.steps[enrollment.current_step];
            if (!step || !enrollment.contact.workspace?.waba) continue;

            try {
                if (step.template_id) {
                    const template = await prisma.template.findUnique({ where: { id: step.template_id } });
                    if (template) {
                        const countryCode = enrollment.contact.phone.replace(/[^0-9]/g, "").substring(0, 2) || "91";
                        const cost = await CreditService.getMessageCost("UTILITY", countryCode, enrollment.contact.workspace_id);
                        
                        await prisma.$transaction(async (tx) => {
                            await CreditService.deductCredits(tx, enrollment.contact.workspace_id, cost, `DRIP-${enrollment.id}-${step.id}`, `Drip Step`);
                        });

                        await metaApiQueue!.add("drip-send", {
                            type: "SEND_TEMPLATE",
                            payload: {
                                phoneNumberId: enrollment.contact.workspace.waba.phone_number_id,
                                accessToken: decrypt(enrollment.contact.workspace.waba.access_token),
                                to: enrollment.contact.phone,
                                templateName: template.name
                            }
                        });
                    }
                }

                const nextIdx = enrollment.current_step + 1;
                const nextStep = enrollment.drip.steps[nextIdx];
                await prisma.dripEnrollment.update({
                    where: { id: enrollment.id },
                    data: {
                        current_step: nextIdx,
                        next_run_at: nextStep ? new Date(Date.now() + nextStep.delay_hours * 3600000) : undefined,
                        is_stopped: !nextStep,
                        // @ts-ignore
                        stop_reason: nextStep ? null : "COMPLETED"
                    }
                });
            } catch (e) {
                console.error(`[Drip Dispatcher] Failed ${enrollment.id}`, e);
            }
        }
    },
    { connection: REDIS_CONNECTION }
);

// ---------------------------------------------------------
// 4. AUTOMATION WORKER
// ---------------------------------------------------------
const automationWorker = new Worker(
    "automation-queue",
    async (job) => {
        if (job.name === "nightly-reconciliation") {
            const { ResellerFinanceEngine } = await import("@/lib/reseller/finance-engine");
            console.log("🌙 [Worker] Starting Nightly Financial Audit...");
            await ResellerFinanceEngine.auditAllWallets();
            console.log("✅ [Worker] Nightly Audit Complete.");
        }

        if (job.name === "abandoned-cart-recovery") {
            const { workspaceId, orderId } = job.data;
            const order = await (prisma as any).commerceOrder.findUnique({
                where: { id: orderId }
            });

            if (order && order.status === "PLACED") {
                const recoveryFlow = await prisma.flow.findFirst({
                    where: { workspace_id: workspaceId, name: { contains: "Abandoned", mode: "insensitive" } }
                });

                if (recoveryFlow) {
                    const contact = await prisma.contact.findFirst({
                        where: { workspace_id: workspaceId, phone: order.customer_phone || "" }
                    });

                    if (contact) {
                        await FlowRunner.startFlow(workspaceId, contact.id, recoveryFlow.id);
                        console.log(`💸 Processing Abandoned Recovery for Order ${orderId}`);
                    }
                }
            }
        }

        if (job.name === "process-flow") {
            const { workspaceId, contactId, messageBody } = job.data;
            console.log(`[Worker] Executing Flow for contact ${contactId}`);
            await FlowRunner.processMessage(workspaceId, contactId, messageBody);
        }

        /**
         * ☢️ NUCLEAR WEBHOOK PROCESSOR
         * Handles the heavy lifting of message ingestion:
         * 1. Contact Upsert
         * 2. Conversation Management
         * 3. Media Downloading (Sync)
         * 4. AI Fallback / Flow Triggering
         */
        if (job.name === "process-whatsapp-message") {
            const { workspaceId, wabaId, message, contactProfile, metadata } = job.data;
            
            try {
                const waba = await prisma.whatsAppAccount.findUnique({
                    where: { id: wabaId },
                    select: { id: true, phone_number_id: true, access_token: true, opt_out_keywords: true, opt_out_reply: true, phone_number: true }
                });
                if (!waba) return;

                const token = decrypt(waba.access_token);
                const phone = message.from;

                // 1. Auto-Healed Contact Strategy
                const contact = await prisma.contact.upsert({
                    where: { workspace_id_phone: { workspace_id: workspaceId, phone } },
                    update: { name: contactProfile?.profile?.name || undefined, updated_at: new Date() },
                    create: { workspace_id: workspaceId, phone, name: contactProfile?.profile?.name || "Unknown", opt_in: true },
                });

                // 2. Conversation Check
                let conversation = await prisma.conversation.findFirst({
                    where: { contact_id: contact.id, status: "OPEN" }
                });
                if (!conversation) {
                    conversation = await prisma.conversation.create({
                        data: { workspace_id: workspaceId, contact_id: contact.id, status: "OPEN" }
                    });
                }

                // 3. Media & Content Normalization
                let msgContent: any = {};
                let msgType: any = "TEXT";

                if (message.text) {
                    msgContent = { body: message.text.body };
                    msgType = "TEXT";
                } else if (message.image) {
                    const localUrl = await WhatsAppMediaDownloader.downloadAndSaveMedia(message.image.id, token, workspaceId);
                    msgContent = { media_id: message.image.id, caption: message.image.caption, link: localUrl };
                    msgType = "IMAGE";
                } else if (message.document) {
                    const localUrl = await WhatsAppMediaDownloader.downloadAndSaveMedia(message.document.id, token, workspaceId);
                    msgType = "DOCUMENT";
                    msgContent = { media_id: message.document.id, filename: message.document.filename, link: localUrl };
                } else if (message.audio) {
                    const localUrl = await WhatsAppMediaDownloader.downloadAndSaveMedia(message.audio.id, token, workspaceId);
                    msgType = "AUDIO";
                    msgContent = { media_id: message.audio.id, link: localUrl };
                } else if (message.video) {
                    const localUrl = await WhatsAppMediaDownloader.downloadAndSaveMedia(message.video.id, token, workspaceId);
                    msgType = "VIDEO";
                    msgContent = { media_id: message.video.id, link: localUrl };
                } else if (message.interactive) {
                    msgType = "INTERACTIVE";
                    msgContent = message.interactive;
                } else if (message.button) {
                    msgType = "INTERACTIVE";
                    msgContent = { button_text: message.button.text, button_payload: message.button.payload };
                }

                // 4. Save to Database
                await prisma.message.create({
                    data: {
                        workspace_id: workspaceId,
                        contact_id: contact.id,
                        conversation_id: conversation.id,
                        meta_id: message.id,
                        type: msgType,
                        direction: "INBOUND",
                        content: msgContent,
                        status: "DELIVERED"
                    }
                });

                // 4.5 🐛 HARD FIX: Force updating the Conversation timestamp!
                // Without this, the chat list won't bump this conversation to the top!
                await prisma.conversation.update({
                    where: { id: conversation.id },
                    data: { updated_at: new Date() }
                });

                // 5. Trigger Flow Engine
                const normalizedMsg = normalizeMessage(message, { metadata });
                await FlowRunner.processMessage(workspaceId, contact.id, normalizedMsg);

            } catch (err: any) {
                console.error(`[Worker ☢️] Inbound message failed for ${message.id}:`, err?.message);
                throw err; // Allow BullMQ retry
            }
        }

        /**
         * ☢️ STATUS UPDATER
         * Real-time message status updates (Sent, Delivered, Read, Failed)
         */
        if (job.name === "process-whatsapp-status") {
            const { statusUpdate } = job.data;
            const messageMetaId = statusUpdate.id;
            const statusStr = statusUpdate.status.toUpperCase();
            const timestamp = statusUpdate.timestamp ? new Date(parseInt(statusUpdate.timestamp) * 1000) : new Date();

            let updateData: any = {};
            if (statusStr === "FAILED" && statusUpdate.errors?.length > 0) {
                const err = statusUpdate.errors[0];
                updateData = { error_code: `${err.code}`, error_message: err.title || err.message, failed_at: timestamp };
            }
            if (statusStr === "SENT") updateData.sent_at = timestamp;
            if (statusStr === "DELIVERED") updateData.delivered_at = timestamp;
            if (statusStr === "READ") updateData.read_at = timestamp;

            try {
                await prisma.message.update({
                    where: { meta_id: messageMetaId },
                    data: { status: statusStr, ...updateData }
                });
            } catch (err: any) {
                // message might not be in DB yet if status arrives very fast
                if (err.code === 'P2025') {
                   console.log(`[Worker] Status arrived before message ${messageMetaId} — will retry later.`);
                   throw new Error("Message not found yet, retrying status update...");
                }
            }
        }

        if (job.name === "edu-lead-followup") {
            const { EduAutomation } = require("@/lib/edu/automation");
            await EduAutomation.handleFollowup(job.data);
        }

        if (job.name === "edu-lead-reminder") {
            const { EduAutomation } = require("@/lib/edu/automation");
            await EduAutomation.handleReminder(job.data);
        }
    },
    { connection: REDIS_CONNECTION }
);

console.log("🚀 Enterprise Workers (Drip Pulse + Meta API + Campaign Dispatch + Audit) Active");
