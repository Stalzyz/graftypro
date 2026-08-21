
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
            await automationQueue.add("daily-drip-campaign", {}, {
                repeat: { pattern: "0 10 * * *" } // Run at 10 AM UTC every day
            });
            console.log("🌙 [Worker] Nightly Reconciliation scheduled (2 AM)");
            console.log("📅 [Worker] Daily Drip Campaign scheduled (10 AM UTC)");
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

                    await prisma.campaign.update({
                        where: { id: payload.campaignId },
                        data: { 
                            status: "FAILED"
                        }
                    }).catch(e => console.error("[MetaAPIWorker] Failed to update campaign status to FAILED:", e));

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

metaApiWorker.on("failed", async (job, err) => {
    if (job?.data?.payload?.campaignId) {
        const campaignId = job.data.payload.campaignId;
        console.warn(`[MetaAPIWorker] ⚠️ Job ${job.id} failed after retries for campaign ${campaignId}: ${err.message}`);
        
        await prisma.campaignStats.update({
            where: { campaign_id: campaignId },
            data: { failed: { increment: 1 } }
        }).catch(() => null);

        const stats = await prisma.campaignStats.findUnique({ where: { campaign_id: campaignId } });
        if (stats) {
            const processed = (stats.sent || 0) + (stats.failed || 0);
            if (stats.total > 0 && processed >= stats.total) {
                await prisma.campaign.update({
                    where: { id: campaignId },
                    data: { status: "COMPLETED" }
                }).catch(() => null);
                console.log(`[MetaAPIWorker] 🏁 Campaign ${campaignId} marked COMPLETED via failure handler (${processed}/${stats.total})`);
            }
        }
    }
});

// ---------------------------------------------------------
// PERIODIC STUCK CAMPAIGN RECOVERY SWEEPER
// ---------------------------------------------------------
setInterval(async () => {
    try {
        const processingCampaigns = await prisma.campaign.findMany({
            where: { status: "PROCESSING" },
            include: { stats: true }
        });

        for (const c of processingCampaigns) {
            if (c.stats) {
                const processed = (c.stats.sent || 0) + (c.stats.failed || 0);
                if (c.stats.total > 0 && processed >= c.stats.total) {
                    await prisma.campaign.update({
                        where: { id: c.id },
                        data: { status: "COMPLETED" }
                    }).catch(() => null);
                    console.log(`[RecoverySweeper] 🧹 Auto-completed fully processed campaign ${c.id} (${processed}/${c.stats.total})`);
                } else {
                    // Stale check: older than 10 minutes without updates
                    const isStale = (Date.now() - new Date(c.updated_at).getTime()) > 10 * 60 * 1000;
                    if (isStale) {
                        await prisma.campaign.update({
                            where: { id: c.id },
                            data: { status: "COMPLETED" }
                        }).catch(() => null);
                        console.log(`[RecoverySweeper] ⌛ Auto-completed stale campaign ${c.id} after 10m timeout.`);
                    }
                }
            }
        }
    } catch (e: any) {
        console.error("[RecoverySweeper] Error in campaign recovery loop:", e.message);
    }
}, 2 * 60 * 1000);

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
                        recipients = optInContacts.filter(c => segmentTargetIds.includes(c.id)).map(c => ({ ...c, name: c.name || "Customer" }));
                    }
                } else if ((campaign.filters as any)?.retarget_campaign_id) {
                    const { CommerceSegmentation } = await import("@/lib/commerce/segmentation");
                    const retargetTargetIds = (await CommerceSegmentation.getSegmentContacts(workspaceId, campaign.filters)).map(c => c.id);
                    recipients = optInContacts.filter(c => retargetTargetIds.includes(c.id)).map(c => ({ ...c, name: c.name || "Customer" }));
                } else if ((campaign.filters as any)?.segment_id) {
                    const storedSegmentId = (campaign.filters as any).segment_id;
                    const segment = await prisma.segment.findUnique({ where: { id: storedSegmentId } });
                    if (segment) {
                        const { CommerceSegmentation } = await import("@/lib/commerce/segmentation");
                        const segmentTargetIds = (await CommerceSegmentation.getSegmentContacts(workspaceId, segment.filters)).map(c => c.id);
                        recipients = optInContacts.filter(c => segmentTargetIds.includes(c.id)).map(c => ({ ...c, name: c.name || "Customer" }));
                    }
                } else {
                    // Send to all Opted-In contacts
                    recipients = optInContacts.map(c => ({ ...c, name: c.name || "Customer" }));
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

        if (job.name === "daily-drip-campaign") {
            console.log("📅 [Worker] Running Daily Drip Campaign Check...");
            const now = new Date();
            
            // Helper to get start and end of a specific day offset
            const getDayRange = (daysAgo: number) => {
                const start = new Date(now);
                start.setDate(start.getDate() - daysAgo);
                start.setHours(0, 0, 0, 0);
                const end = new Date(start);
                end.setHours(23, 59, 59, 999);
                return { gte: start, lte: end };
            };

            const day2 = getDayRange(2);
            const day5 = getDayRange(5);
            const day10 = getDayRange(10);

            // Fetch workspaces matching these ranges
            const targetWorkspaces = await prisma.workspace.findMany({
                where: {
                    OR: [
                        { created_at: day2 },
                        { created_at: day5 },
                        { created_at: day10 }
                    ],
                },
                select: { id: true, name: true, created_at: true, users: { select: { email: true }, take: 1 } }
            });

            const { systemEmailQueue } = await import("@/lib/queue");

            if (systemEmailQueue) {
                for (const workspace of targetWorkspaces) {
                    const ageInMs = now.getTime() - workspace.created_at.getTime();
                    const ageInDays = Math.floor(ageInMs / (1000 * 60 * 60 * 24));
                    
                    let emailType = null;
                    if (ageInDays === 2) emailType = "DRIP_DAY_2";
                    else if (ageInDays === 5) emailType = "DRIP_DAY_5";
                    else if (ageInDays === 10) emailType = "DRIP_DAY_10";

                    const email = workspace.users[0]?.email;
                    if (emailType && email) {
                        await systemEmailQueue.add("send-system-email", {
                            type: emailType,
                            payload: {
                                to: email,
                                vendorName: workspace.name
                            }
                        });
                        console.log(`[Worker] Queued ${emailType} for ${email}`);
                    }
                }
            }
            console.log("✅ [Worker] Daily Drip Campaign Check Complete.");
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

// ---------------------------------------------------------
// 5. SYSTEM EMAIL WORKER (Resend)
// ---------------------------------------------------------
const systemEmailWorker = new Worker(
    "system-email-queue",
    async (job) => {
        const { type, payload } = job.data;
        console.log(`[EmailWorker] 📧 Processing ${type} email for workspace ${payload.workspaceId}`);
        
        try {
            const { resend } = await import("@/lib/email/resend");
            
            if (type === "PLAN_DOWNGRADE") {
                const { to, vendorName, newPlan, oldPlan } = payload;
                
                await resend.emails.send({
                    from: "Grafty Notifications <notifications@grafty.io>", // Replace with verified domain later
                    to: to,
                    subject: "Important: Your Subscription Plan has been Downgraded",
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2>Subscription Update</h2>
                            <p>Hi ${vendorName},</p>
                            <p>This is an automated notification to inform you that your workspace's subscription has been downgraded from <strong>${oldPlan}</strong> to <strong>${newPlan}</strong>.</p>
                            <p>As a result, access to premium modules (such as CRM, E-Commerce, Academy, etc.) has been restricted in accordance with the new plan.</p>
                            <p>If you believe this was a mistake or you wish to upgrade again, please log in to your dashboard or contact support.</p>
                            <br/>
                            <p>Best regards,<br/>The Grafty Team</p>
                        </div>
                    `
                });
                console.log(`[EmailWorker] ✅ PLAN_DOWNGRADE email sent to ${to}`);
            }

            if (type === "PAYMENT_SUCCESS") {
                const { to, vendorName, amount, currency, invoiceUrl } = payload;
                
                await resend.emails.send({
                    from: "Grafty Billing <billing@grafty.io>", 
                    to: to,
                    cc: ["greeksacademy@gmail.com"], // Hardcoded CC for accounting/notifs
                    subject: "Payment Receipt & Subscription Upgrade",
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2>Payment Successful!</h2>
                            <p>Hi ${vendorName},</p>
                            <p>Thank you for your payment of <strong>${currency} ${amount}</strong>.</p>
                            <p>Your subscription has been successfully updated, and premium modules have been unlocked.</p>
                            ${invoiceUrl ? `<p><a href="${invoiceUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Download Invoice</a></p>` : ''}
                            <br/>
                            <p>Best regards,<br/>The Grafty Team</p>
                        </div>
                    `
                });
                console.log(`[EmailWorker] ✅ PAYMENT_SUCCESS email sent to ${to} (CC: greeksacademy)`);
            }

            if (type === "LOW_CREDIT_BALANCE") {
                const { to, vendorName, currentBalance } = payload;
                
                await resend.emails.send({
                    from: "Grafty Alerts <alerts@grafty.io>", 
                    to: to,
                    subject: "Action Required: Low Wallet Balance Alert",
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #e74c3c;">Low Credit Balance</h2>
                            <p>Hi ${vendorName},</p>
                            <p>This is an automated alert to let you know that your wallet balance has dropped to <strong>${currentBalance} credits</strong>.</p>
                            <p>If your balance reaches 0, your automated WhatsApp flows and campaigns will stop working.</p>
                            <p><a href="https://grafty.pro/super-admin/dashboard/credits" style="background-color: #e74c3c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Recharge Now</a></p>
                            <br/>
                            <p>Best regards,<br/>The Grafty Team</p>
                        </div>
                    `
                });
                console.log(`[EmailWorker] ✅ LOW_CREDIT_BALANCE email sent to ${to}`);
            }

            if (type === "WELCOME_EMAIL") {
                const { to, vendorName, dashboardUrl } = payload;
                
                await resend.emails.send({
                    from: "Grafty Welcome <hello@grafty.io>", 
                    to: to,
                    subject: "Welcome to Grafty! Get Started in 5 Minutes",
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2>Welcome to Grafty! 🎉</h2>
                            <p>Hi ${vendorName},</p>
                            <p>We're thrilled to have you onboard. Grafty is the most powerful platform to scale your WhatsApp marketing and automations.</p>
                            <h3>Next Steps:</h3>
                            <ol>
                                <li>Connect your Meta Business Manager.</li>
                                <li>Create your first automation flow.</li>
                                <li>Import your contacts into the CRM.</li>
                            </ol>
                            <p><a href="${dashboardUrl || 'https://grafty.pro/super-admin/login'}" style="background-color: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Dashboard</a></p>
                            <br/>
                            <p>Best regards,<br/>The Grafty Team</p>
                        </div>
                    `
                });
                console.log(`[EmailWorker] ✅ WELCOME_EMAIL email sent to ${to}`);
            }

            if (type === "DRIP_DAY_2") {
                const { to, vendorName } = payload;
                await resend.emails.send({
                    from: "Grafty Success <success@grafty.io>", 
                    to: to,
                    subject: "Have you built your first flow yet?",
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2>Day 2: Build Your First Automation! 🤖</h2>
                            <p>Hi ${vendorName},</p>
                            <p>It's been a couple of days since you joined Grafty. Have you had a chance to explore the Flow Builder?</p>
                            <p>Setting up an automated greeting or away message is the easiest way to start saving time immediately.</p>
                            <p><a href="https://grafty.pro/super-admin/dashboard/automation" style="background-color: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Open Flow Builder</a></p>
                            <br/>
                            <p>Best regards,<br/>The Grafty Success Team</p>
                        </div>
                    `
                });
                console.log(`[EmailWorker] ✅ DRIP_DAY_2 email sent to ${to}`);
            }

            if (type === "DRIP_DAY_5") {
                const { to, vendorName } = payload;
                await resend.emails.send({
                    from: "Grafty Success <success@grafty.io>", 
                    to: to,
                    subject: "Turn your contacts into customers",
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2>Day 5: Supercharge your CRM 📈</h2>
                            <p>Hi ${vendorName},</p>
                            <p>Did you know you can easily import all your existing customers into Grafty?</p>
                            <p>Once imported, you can launch broadcast campaigns to reactivate old leads and drive instant sales.</p>
                            <p><a href="https://grafty.pro/super-admin/dashboard/crm" style="background-color: #25D366; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to CRM</a></p>
                            <br/>
                            <p>Best regards,<br/>The Grafty Success Team</p>
                        </div>
                    `
                });
                console.log(`[EmailWorker] ✅ DRIP_DAY_5 email sent to ${to}`);
            }

            if (type === "DRIP_DAY_10") {
                const { to, vendorName } = payload;
                await resend.emails.send({
                    from: "Grafty Billing <billing@grafty.io>", 
                    to: to,
                    subject: "Your Free Trial is Ending Soon!",
                    html: `
                        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                            <h2 style="color: #e74c3c;">Trial Expiring Soon ⏰</h2>
                            <p>Hi ${vendorName},</p>
                            <p>We hope you're loving Grafty! Your free trial is coming to an end in just a few days.</p>
                            <p>To ensure your WhatsApp automations and campaigns continue running without interruption, please select a subscription plan.</p>
                            <p><a href="https://grafty.pro/super-admin/dashboard/packages" style="background-color: #e74c3c; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Upgrade Now</a></p>
                            <br/>
                            <p>Best regards,<br/>The Grafty Team</p>
                        </div>
                    `
                });
                console.log(`[EmailWorker] ✅ DRIP_DAY_10 email sent to ${to}`);
            }
            
            if (type === "FLOW_PAYMENT_SUCCESS") {
                const { 
                    to, 
                    vendorName, 
                    customerPhone, 
                    customerName, 
                    txnId, 
                    amount, 
                    gateway, 
                    flowState, 
                    recentMessages 
                } = payload;

                // Build flow variables section
                const flowVarsHtml = flowState && Object.keys(flowState).length > 0
                    ? `
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
                            <h3 style="margin: 0 0 10px 0; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">📋 Form Details Collected</h3>
                            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                ${Object.entries(flowState as Record<string, any>)
                                    .filter(([k]) => !k.startsWith('_'))
                                    .map(([key, value]) => `
                                        <tr>
                                            <td style="padding: 6px 0; color: #6b7280; font-weight: 500; width: 40%; text-transform: capitalize;">${key.replace(/_/g, ' ')}</td>
                                            <td style="padding: 6px 0; color: #111827; font-weight: 600;">${String(value)}</td>
                                        </tr>
                                    `).join('')}
                            </table>
                        </div>`
                    : '<p style="color: #9ca3af; font-size: 13px; font-style: italic;">No form data collected.</p>';

                // Build recent messages section
                const messagesHtml = recentMessages
                    ? `
                        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 16px 0;">
                            <h3 style="margin: 0 0 10px 0; color: #166534; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">💬 Last 5 Messages</h3>
                            <div style="font-family: monospace; font-size: 13px; color: #374151; white-space: pre-wrap; line-height: 1.8;">${recentMessages}</div>
                        </div>`
                    : '';

                await resend.emails.send({
                    from: "Grafty Payments <notifications@grafty.io>",
                    to: to,
                    subject: `💰 New Payment Received — ₹${amount} from ${customerName}`,
                    html: `
                        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
                            <!-- Header -->
                            <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); padding: 32px 32px 24px; border-radius: 12px 12px 0 0;">
                                <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 700;">💰 New Payment Received!</h1>
                                <p style="margin: 8px 0 0 0; color: #94a3b8; font-size: 14px;">A customer just completed a payment via your WhatsApp Flow.</p>
                            </div>

                            <!-- Amount Hero -->
                            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px 32px; margin: 0;">
                                <p style="margin: 0; font-size: 36px; font-weight: 800; color: #15803d;">₹${amount}</p>
                                <p style="margin: 4px 0 0 0; color: #16a34a; font-size: 14px; font-weight: 500;">Payment Successful via ${gateway}</p>
                            </div>

                            <!-- Customer Info -->
                            <div style="padding: 24px 32px 0;">
                                <h3 style="margin: 0 0 12px 0; color: #374151; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">👤 Customer Details</h3>
                                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                    <tr>
                                        <td style="padding: 6px 0; color: #6b7280; width: 35%;">Name</td>
                                        <td style="padding: 6px 0; color: #111827; font-weight: 600;">${customerName}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 6px 0; color: #6b7280;">WhatsApp</td>
                                        <td style="padding: 6px 0; color: #111827; font-weight: 600;">+${customerPhone}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 6px 0; color: #6b7280;">Gateway</td>
                                        <td style="padding: 6px 0; color: #111827; font-weight: 600;">${gateway}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 6px 0; color: #6b7280;">Transaction ID</td>
                                        <td style="padding: 6px 0; color: #6b7280; font-size: 12px; font-family: monospace;">${txnId}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 6px 0; color: #6b7280;">Time</td>
                                        <td style="padding: 6px 0; color: #111827;">${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })} IST</td>
                                    </tr>
                                </table>
                            </div>

                            <!-- Flow Variables -->
                            <div style="padding: 8px 32px 0;">${flowVarsHtml}</div>

                            <!-- Recent Messages -->
                            <div style="padding: 8px 32px 0;">${messagesHtml}</div>

                            <!-- CTA -->
                            <div style="padding: 24px 32px 32px; text-align: center;">
                                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" 
                                   style="display: inline-block; background: #2563eb; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
                                    View in Dashboard →
                                </a>
                            </div>

                            <!-- Footer -->
                            <div style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 16px 32px; border-radius: 0 0 12px 12px;">
                                <p style="margin: 0; color: #9ca3af; font-size: 12px; text-align: center;">
                                    This notification was sent by ${vendorName}'s Grafty workspace.
                                </p>
                            </div>
                        </div>
                    `
                });
                console.log(`[EmailWorker] ✅ FLOW_PAYMENT_SUCCESS email sent to ${to} (Customer: ${customerName}, Amount: ₹${amount})`);
            }
        } catch (err: any) {
            console.error(`[EmailWorker] ❌ Failed to send ${type} email:`, err.message);
            throw err; // Trigger BullMQ retry
        }
    },
    { 
        connection: REDIS_CONNECTION,
        concurrency: 5 
    }
);
