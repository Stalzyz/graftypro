
import { Worker } from "bullmq";
import { prisma } from "@/lib/db";
import { WhatsAppService } from "@/lib/whatsapp/service";
import { FlowRunner } from "@/lib/engine/flow-runner";
import { CreditService } from "@/lib/credits/service";
import { decrypt, maskToken } from "@/lib/security/encryption";
import { WhatsAppMediaDownloader } from "@/lib/whatsapp/media-downloader";
import { normalizeMessage } from "@/lib/engine/message-normalizer";
import { PRIORITY_HIGH, PRIORITY_LOW } from "@/lib/queue";
import { CampaignStatusCache, RateLimiter } from "@/lib/redis-status";

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
        
        // ☢️ NUCLEAR PHONE NORMALIZATION
        let toRaw = payload.to || payload.phone || "";
        let to = toRaw.replace(/\D/g, ""); 
        if (to.length === 10) to = "91" + to; // Auto-fix missing country code for India
        if (to.length === 12 && to.startsWith("0")) to = to.substring(1); // Fix 0-prefixing

        console.log(`[MetaAPIWorker] 📡 Processing ${type} for ${to} (Priority: ${job.opts.priority || 'DEFAULT'})`);

        const { phoneNumberId, accessToken } = payload;

        try {
            const workspaceId = payload.workspaceId;
            const campaignId = payload.campaignId;
            const category = type === "SEND_TEMPLATE" ? "MARKETING" : "SERVICE";

            // 🛑 ☢️ BSP-GRADE PAUSE / CANCEL INTERCEPTOR (Redis-Backed)
            if (campaignId) {
                const cachedStatus = await CampaignStatusCache.get(campaignId);
                
                // If not in cache, fetch once and populate
                const currentStatus = cachedStatus || (await prisma.campaign.findUnique({
                    where: { id: campaignId },
                    select: { status: true }
                }))?.status;

                if (currentStatus === "PAUSED") {
                    console.log(`[MetaAPIWorker] ⏸️ Campaign ${campaignId} paused. Yielding job.`);
                    await job.moveToDelayed(Date.now() + 15000, job.token); // Retry in 15s instead of 30s
                    return;
                }
                if (currentStatus === "CANCELLED") {
                    console.log(`[MetaAPIWorker] 🛑 Campaign ${campaignId} cancelled. Dropping job.`);
                    return;
                }
                
                // Keep cache warm
                if (!cachedStatus && currentStatus) {
                    await CampaignStatusCache.set(campaignId, currentStatus);
                }
            }

                // 🚦 RATE LIMITER (Throttling) - Compliance Tier Check
                const throttleKey = `ratelimit:waba:${phoneNumberId}`;
                const isAllowed = await RateLimiter.isAllowed(throttleKey, 80, 1); // 80 msgs per second (Safe start)
                if (!isAllowed) {
                    console.warn(`[MetaAPIWorker] 🚦 Rate limit hit for ${phoneNumberId}. Backing off...`);
                    await job.moveToDelayed(Date.now() + 2000, job.token);
                    return;
                }

                // 😵 CONTACT FATIGUE (Frequency Capping)
                // Skip marketing messages if contact recently received one
                if (category === "MARKETING") {
                    const fatigued = await CampaignStatusCache.isFatigued(payload.contactId);
                    if (fatigued) {
                        console.log(`[MetaAPIWorker] 😵 Contact ${payload.contactId} is fatigued. Skipping to protect engagement.`);
                        if (campaignId) {
                            await prisma.campaignStats.update({
                                where: { campaign_id: campaignId },
                                data: { failed: { increment: 1 } }
                            }).catch(e => null);
                        }
                        return; // Drop job silently (skipping)
                    }
                }

            let result;
            switch (type) {
                case "SEND_TEMPLATE":
                    result = await WhatsAppService.sendTemplate(
                        phoneNumberId,
                        accessToken,
                        to,
                        payload.templateName,
                        payload.langCode || "en_US", // Final fallback
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
            if (result && result.messages && result.messages.length > 0) {
                const metaMessageId = result.messages[0].id;
                console.log(`[MetaAPIWorker] ✅ SEND_TEMPLATE to: ${to} → Meta ID: ${metaMessageId}`);
                
                // 1. Resolve conversation context
                let conversation = await prisma.conversation.findFirst({
                    where: { contact_id: payload.contactId, status: "OPEN" }
                });
                
                if (!conversation) {
                    conversation = await prisma.conversation.create({
                        data: { workspace_id: workspaceId, contact_id: payload.contactId, status: "OPEN" }
                    });
                }
                
                // 2. ☢️ NUCLEAR FIX: Persist with campaign_id as a proper DB column (not inside JSON)
                await (prisma as any).message.create({
                    data: {
                        workspace_id: workspaceId,
                        contact_id: payload.contactId,
                        conversation_id: conversation.id,
                        meta_id: metaMessageId,
                        type: type === "SEND_TEMPLATE" ? "TEMPLATE" : 
                              type === "SEND_INTERACTIVE" ? "INTERACTIVE" : "TEXT",
                        direction: "OUTBOUND",
                        status: "SENT",
                        sent_at: new Date(),
                        campaign_id: campaignId || null,
                        content: {
                            template_name: payload.templateName,
                            body: payload.body || "Template Message"
                        },
                        template_name: payload.templateName,
                        conversation_category: category,
                    }
                }).catch((e: any) => console.error(`[MetaAPIWorker] Failed to save message record:`, e.message));

                // 😵 Track Fatigue for marketing messages
                if (category === "MARKETING") {
                    await CampaignStatusCache.trackFatigue(payload.contactId);
                }

                // 3. Atomic stats + completion check
                if (campaignId) {
                    await prisma.campaignStats.update({
                        where: { campaign_id: campaignId },
                        data: { sent: { increment: 1 } }
                    }).catch(e => null);

                    // ☢️ ATOMIC COMPLETION: Check if all campaign jobs are now drained
                    const stats = await prisma.campaignStats.findUnique({ where: { campaign_id: campaignId } });
                    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId }, select: { status: true } });
                    if (stats && campaign && campaign.status === "PROCESSING") {
                        const processed = (stats.sent || 0) + (stats.failed || 0);
                        if (stats.total > 0 && processed >= stats.total) {
                            await prisma.campaign.update({
                                where: { id: campaignId },
                                data: { status: "COMPLETED" }
                            }).catch(e => null);
                            console.log(`[MetaAPIWorker] 🏁 Campaign ${campaignId} marked COMPLETED (${processed}/${stats.total})`);
                        }
                    }
                }
            }

            return result;
        } catch (err: any) {
            console.error(`[MetaAPIWorker] ❌ Failed to process ${type}:`, err.response?.data || err.message);
            
            // Check for unrecoverable broadcast errors
            if (payload.campaignId) {
                const responseData = err.response?.data?.error;
                const metaErrorCode = responseData?.code || err.response?.status;
                const metaErrorMessage = responseData?.message || err.message;
                
                // ☢️ BSP ERROR CLASSIFICATION
                const isTemplateError = metaErrorMessage?.includes("Translation does not exist") || metaErrorCode === 132001;
                const isFatal = isTemplateError 
                    || err.message?.includes("BILLING_ERROR") 
                    || err.response?.status === 400 
                    || err.response?.status === 404
                    || err.response?.status === 401;
                
                if (isFatal) {
                    const isBillingError = metaErrorCode === 131031 || metaErrorCode === 131999 || err.response?.status === 402;
                    
                    console.error(`[MetaAPIWorker] 🔴 FATAL ERROR for Campaign ${payload.campaignId}: [${metaErrorCode}] ${metaErrorMessage}`);
                    
                    if (isTemplateError) {
                        console.warn(`[MetaAPIWorker] 💡 PRO-TIP: Meta India templates require 'en_US'. Your template '${payload.templateName}' might be mislabeled as 'en'.`);
                    }

                    if (isBillingError) {
                        console.warn(`[MetaAPIWorker] 💳 ☢️ PRO-TIP: This looks like a Meta Billing/Payment issue. Please check your Payment Method in WhatsApp Business Manager!`);
                    }

                    // Update failed stats
                    await prisma.campaignStats.update({
                        where: { campaign_id: payload.campaignId },
                        data: { failed: { increment: 1 } }
                    }).catch(e => null);
                    
                    // ☢️ NUCLEAR FIX: Do NOT write invalid FK conversation_id.
                    // Just log the failure - stats are already tracked above.
                    console.error(`[MetaAPIWorker] 🔴 Fatal broadcast failure for campaign ${payload.campaignId}: [${metaErrorCode}] ${metaErrorMessage}`);

                    // Check completion after fatal failure
                    const updatedStats = await prisma.campaignStats.findUnique({ where: { campaign_id: payload.campaignId } });
                    if (updatedStats) {
                        const processed = (updatedStats.sent || 0) + (updatedStats.failed || 0);
                        if (updatedStats.total > 0 && processed >= updatedStats.total) {
                            await prisma.campaign.update({
                                where: { id: payload.campaignId },
                                data: { status: "COMPLETED" }
                            }).catch(e => null);
                        }
                    }
                    return; // Gracefully complete job - no infinite retry
                }
            }
            throw err; // Trigger BullMQ retry for transient network errors
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

            // ☢️ NUCLEAR FIX: Look up template language AFTER campaign is confirmed to exist
            const templateRecord = await prisma.template.findFirst({
                where: {
                    workspace_id: campaign.workspace_id,
                    name: (campaign as any).template_name
                },
                select: { language: true, name: true, status: true }
            });
            
            if (!templateRecord) {
                console.error(`[CampaignWorker] ❌ Template '${(campaign as any).template_name}' not found in workspace. Aborting campaign.`);
                await prisma.campaign.update({ where: { id: campaignId }, data: { status: "COMPLETED" } });
                return;
            }
            if (templateRecord.status !== 'APPROVED') {
                console.error(`[CampaignWorker] ❌ Template '${templateRecord.name}' is NOT APPROVED (status: ${templateRecord.status}). Aborting.`);
                await prisma.campaign.update({ where: { id: campaignId }, data: { status: "COMPLETED" } });
                return;
            }
            const resolvedLangCode = templateRecord.language || "en_US";
            console.log(`[CampaignWorker] ✅ Template '${templateRecord.name}' resolved, language: ${resolvedLangCode}`);

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
                recipients = leads.map(l => ({ ...l, phone: l.whatsapp_number, name: l.student_name }));
            } else {
                // Precision BSP Audience Unroller
                const allContacts = await prisma.contact.findMany({ where: { workspace_id: workspaceId, blocked: false } });
                const optInContacts = allContacts.filter(c => (c as any).opt_in === true);
                
                if (allContacts.length > optInContacts.length) {
                    console.log(`[CampaignWorker] 🛡️ Skipping ${allContacts.length - optInContacts.length} contacts due to missing Opt-In (BSP Compliance).`);
                }

                if (segmentId) {
                    const segment = await prisma.segment.findUnique({ where: { id: segmentId } });
                    if (segment) {
                        const { CommerceSegmentation } = await import("@/lib/commerce/segmentation");
                        const segmentTargetIds = (await CommerceSegmentation.getSegmentContacts(workspaceId, segment.filters)).map(c => c.id);
                        recipients = optInContacts.filter(c => segmentTargetIds.includes(c.id)).map(c => ({ ...c }));
                    }
                } else if ((campaign.filters as any)?.retarget_campaign_id) {
                    const { CommerceSegmentation } = await import("@/lib/commerce/segmentation");
                    const retargetTargetIds = (await CommerceSegmentation.getSegmentContacts(workspaceId, campaign.filters)).map(c => c.id);
                    recipients = optInContacts.filter(c => retargetTargetIds.includes(c.id)).map(c => ({ ...c }));
                } else if ((campaign.filters as any)?.segment_id) {
                    const storedSegmentId = (campaign.filters as any).segment_id;
                    const segment = await prisma.segment.findUnique({ where: { id: storedSegmentId } });
                    if (segment) {
                        const { CommerceSegmentation } = await import("@/lib/commerce/segmentation");
                        const segmentTargetIds = (await CommerceSegmentation.getSegmentContacts(workspaceId, segment.filters)).map(c => c.id);
                        recipients = optInContacts.filter(c => segmentTargetIds.includes(c.id)).map(c => ({ ...c }));
                    }
                } else {
                    // Send to all Opted-In contacts
                    recipients = optInContacts.map(c => ({ ...c }));
                }
            }

            console.log(`[CampaignWorker] Audience fetched. Size: ${recipients.length}`);

            // ☢️ NUCLEAR MEDIA HARDENING
            // If the campaign has a header media URL, and it's local, we upload it to Meta ONCE
            // for the entire campaign to get a media_id.
            let preUploadedMediaId: string | null = null;
            const campaignAny = campaign as any;

            if (campaignAny.header_media_url) {
                console.log(`[CampaignWorker] ☢️ Checking Header Media for Nuclear Hardening: ${campaignAny.header_media_url}`);
                
                const isLocal = campaignAny.header_media_url.includes("/api/media/local") || !campaignAny.header_media_url.startsWith("http");
                
                if (isLocal) {
                    try {
                        let finalUrl = campaignAny.header_media_url;
                        if (!finalUrl.startsWith("http")) {
                            // Resolve internal path to a full local proxy URL
                            const host = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
                            finalUrl = `${host}${finalUrl.startsWith("/") ? "" : "/"}${finalUrl}`;
                        }

                        console.log(`[CampaignWorker] 🚀 Performing ONE-TIME Nuclear Upload to Meta: ${finalUrl}`);
                        preUploadedMediaId = await WhatsAppService.uploadMediaFromUrl(
                            finalUrl,
                            waba.phone_number_id,
                            decryptedToken
                        );
                        
                        if (preUploadedMediaId) {
                            console.log(`[CampaignWorker] ✅ Nuclear Hardening Success! Using media_id: ${preUploadedMediaId}`);
                        } else {
                            console.warn(`[CampaignWorker] ⚠️ Nuclear Upload failed, falling back to URL-based linkage.`);
                        }
                    } catch (err: any) {
                        console.error(`[CampaignWorker] ❌ Nuclear Hardening technical failure:`, err.message);
                    }
                }
            }

            // Fallback for empty segment / no audience
            if (recipients.length === 0) {
                console.log(`[CampaignWorker] ⚡ Fast-completing Campaign ${campaignId} with 0 recipients.`);
                await prisma.campaign.update({
                    where: { id: campaignId },
                    data: {
                        status: "COMPLETED",
                        stats: {
                            upsert: { create: { total: 0, sent: 0, failed: 0 }, update: { total: 0 } }
                        }
                    }
                });
                return;
            }

            // ☢️ NUCLEAR STATUS INITIALIZATION (Redis Sync)
            await CampaignStatusCache.set(campaignId, "PROCESSING");

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
                    
                    // 🎯 DYNAMIC MAPPING ENGINE
                    const campaignAny = campaign as any;
                    const variableMapping = (campaignAny.variable_mapping as Record<string, string>) || {};
                    const bodyParams = Object.entries(variableMapping)
                        .sort(([a], [b]) => parseInt(a) - parseInt(b))
                        .map(([index, source]) => {
                            let value = "Customer";
                             // @ts-ignore
                            if (source.startsWith("static:")) {
                                 // @ts-ignore
                                value = source.replace("static:", "");
                            } else {
                                // @ts-ignore
                                value = person[source] || person.name || "Customer";
                            }
                            return { type: "text", text: String(value) };
                        });

                    const components: any[] = [];
                    
                    // Add Header if override exists
                    if (campaignAny.header_media_url) {
                        const isImage = campaignAny.header_media_url.match(/\.(jpg|jpeg|png|webp)$/i);
                        const mediaType = isImage ? "image" : "video"; // Fallback to video/document if not image
                        
                        if (preUploadedMediaId) {
                            // ✅ Uses the HARDENED media_id
                            components.push({
                                type: "header",
                                parameters: [
                                    {
                                        type: mediaType,
                                        [mediaType]: { id: preUploadedMediaId }
                                    }
                                ]
                            });
                        } else {
                            // ⚠️ Fallback to the link (standard Meta fetch)
                            components.push({
                                type: "header",
                                parameters: [
                                    {
                                        type: mediaType,
                                        [mediaType]: { link: campaignAny.header_media_url }
                                    }
                                ]
                            });
                        }
                    }

                    // Add Body Variables
                    if (bodyParams.length > 0) {
                        components.push({
                            type: "body",
                            parameters: bodyParams
                        });
                    }

                    // Construct individual job
                    return {
                        name: "send-template",
                        data: {
                            type: "SEND_TEMPLATE",
                            payload: {
                                campaignId,
                                workspaceId,
                                contactId: person.id,
                                phoneNumberId: waba.phone_number_id,
                                accessToken: decryptedToken,
                                to: person.phone,
                                templateName: campaign.template_name,
                                langCode: resolvedLangCode, // Real Root Cause Fix: use actual template language from DB
                                components
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
            
            // Notice: The campaign status is marked as COMPLETED by the MetaAPI worker dynamically
            console.log(`[CampaignWorker] ✅ Unrolling complete for Campaign: ${campaignId}. Status remains PROCESSING until queue clears.`);

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
                        await metaApiQueue!.add("drip-send", {
                            type: "SEND_TEMPLATE",
                            payload: {
                                phoneNumberId: enrollment.contact.workspace.waba.phone_number_id,
                                accessToken: decrypt(enrollment.contact.workspace.waba.access_token),
                                to: enrollment.contact.phone,
                                templateName: template.name,
                                workspaceId: enrollment.contact.workspace_id,
                                contactId: enrollment.contact.id
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
         * 🛒 NATIVE META CART ORDER PROCESSOR
         * Converts WhatsApp native cart orders into CommerceOrder records
         * and auto-generates payment links.
         */
        if (job.name === "process-meta-cart-order") {
            const { workspaceId, contactId, orderPayload } = job.data;
            console.log(`[Worker] 🛒 Processing native WhatsApp cart order for contact ${contactId}`);
            
            try {
                const { CatalogEngine } = await import("@/lib/commerce/catalog-engine");
                const { PaymentEngine } = await import("@/lib/commerce/payment-engine");

                // 1. Create order from Meta cart
                const order = await CatalogEngine.processMetaCartOrder(workspaceId, contactId, orderPayload);
                console.log(`[Worker] ✅ Cart order created: ${order.order_number}`);

                // 2. Auto-generate and send payment link
                const paymentResult = await PaymentEngine.createAndSendPaymentLink(order.id);
                console.log(`[Worker] 💳 Payment link sent via ${paymentResult.gateway}: ${paymentResult.paymentUrl}`);
            } catch (err: any) {
                console.error(`[Worker] ❌ Cart order processing failed:`, err.message);
                throw err; // Allow BullMQ retry
            }
        }

        /**
         * 💳 SEND PAYMENT LINK
         * Generates a payment link for an existing order and sends it to the customer.
         */
        if (job.name === "send-payment-link") {
            const { orderId } = job.data;
            console.log(`[Worker] 💳 Generating payment link for order: ${orderId}`);
            
            try {
                const { PaymentEngine } = await import("@/lib/commerce/payment-engine");
                const result = await PaymentEngine.createAndSendPaymentLink(orderId);
                console.log(`[Worker] ✅ Payment link sent via ${result.gateway}`);
            } catch (err: any) {
                console.error(`[Worker] ❌ Payment link failed:`, err.message);
                throw err;
            }
        }

        /**
         * ☢️ NUCLEAR WEBHOOK PROCESSOR (Legacy / Fallback)
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
                // ☢️ NUCLEAR FIX: Select campaign_id as real DB column (not from JSON)
                const existingMsg = await (prisma as any).message.findUnique({
                    where: { meta_id: messageMetaId },
                    select: { id: true, campaign_id: true }
                });

                if (existingMsg) {
                    await (prisma as any).message.update({
                        where: { id: existingMsg.id },
                        data: { status: statusStr, ...updateData }
                    });

                    // 📈 Campaign Analytics Synchronization (real column)
                    const cmpId = existingMsg.campaign_id;
                    if (cmpId) {
                         if (statusStr === "DELIVERED") {
                             await prisma.campaignStats.update({ where: { campaign_id: cmpId }, data: { delivered: { increment: 1 } } }).catch(e => null);
                         } else if (statusStr === "READ") {
                             await prisma.campaignStats.update({ where: { campaign_id: cmpId }, data: { read: { increment: 1 } } }).catch(e => null);
                         } else if (statusStr === "FAILED") {
                             // Atomic Truth Bridging: move from sent to failed
                             await prisma.campaignStats.update({ where: { campaign_id: cmpId }, data: { failed: { increment: 1 }, sent: { decrement: 1 } } }).catch(e => null);
                         }
                    }
                } else {
                    console.log(`[Worker] Status arrived but message not yet in DB ${messageMetaId} — throwing to retry.`);
                    throw new Error("P2025");
                }
            } catch (err: any) {
                // message might not be in DB yet if status arrives very fast
                if (err.code === 'P2025' || err.message === 'P2025') {
                   console.log(`[Worker] Retrying status update...`);
                   throw new Error("Message not found yet, retrying status update...");
                }
            }
        }

        if (job.name === "edu-lead-reminder") {
            const { EduAutomation } = require("@/lib/edu/automation");
            await EduAutomation.handleReminder(job.data);
        }
    },
    { connection: REDIS_CONNECTION }
);

/**
 * ☢️ KNOWLEDGE INGESTION WORKER
 * Offloads heavy document processing (PDF parsing, OCR, Embeddings)
 * to prevent web process locking and bundle-missing issues.
 */
const knowledgeWorker = new Worker(
    "knowledge-queue",
    async (job) => {
        const { sourceId } = job.data;
        console.log(`[KnowledgeWorker] 🧠 Ingesting Source: ${sourceId}`);
        
        try {
            const { KnowledgeEngine } = await import("@/lib/ai/knowledge-engine");
            const result = await KnowledgeEngine.ingest(sourceId);
            console.log(`[KnowledgeWorker] ✅ Ingestion Complete for ${sourceId}:`, result);
        } catch (err: any) {
            console.error(`[KnowledgeWorker] ❌ Ingestion Failed for ${sourceId}:`, err.message);
            throw err; // Trigger BullMQ retry
        }
    },
    { 
        connection: REDIS_CONNECTION,
        concurrency: 5 // Process up to 5 documents in parallel
    }
);

console.log("🚀 Enterprise Workers (Drip Pulse + Meta API + Campaign Dispatch + Knowledge) Active");
