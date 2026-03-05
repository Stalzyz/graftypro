
import { Worker } from "bullmq";
import { prisma } from "@/lib/db";
import { WhatsAppService } from "@/lib/whatsapp/service";
import { FlowRunner } from "@/lib/engine/flow-runner";
import { CreditService } from "@/lib/credits/service";
import { decrypt } from "@/lib/security/encryption";

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

        // Start Global Health Monitor
        const { HealthMonitorService } = await import("@/lib/whatsapp/health-monitor");
        console.log("🩺 [Worker] Initializing Connection Health Monitor...");

        // Run once on startup
        HealthMonitorService.runGlobalHealthCheck().catch(console.error);

        // Then run every 6 hours (21600000 ms)
        setInterval(() => {
            HealthMonitorService.runGlobalHealthCheck().catch(console.error);
        }, 6 * 60 * 60 * 1000);

    } catch (err) {
        console.error("❌ [Worker] CRITICAL: DB connection failed!", err);
    }
})();

// ---------------------------------------------------------
// 1. CAMPAIGN WORKER (Bulk Processing)
// ---------------------------------------------------------
const campaignWorker = new Worker(
    "campaign-queue",
    async (job) => {
        const { campaignId, workspaceId, segmentId, targetStatus, course } = job.data;
        console.log(`[Worker] Processing Campaign: ${campaignId} (Type: ${job.name})`);

        try {
            // A. Fetch Campaign Details
            // A. Fetch Campaign Details
            const campaign = await prisma.campaign.findUnique({
                where: { id: campaignId }
            });

            if (!campaign) {
                console.error(`[Worker] Campaign ${campaignId} not found.`);
                return;
            }

            // Fetch WABA separately to avoid Workspace schema issues
            const waba = await prisma.whatsAppAccount.findUnique({
                where: { workspace_id: campaign.workspace_id }
            });

            if (!waba) {
                console.error(`[Worker] WABA not found for workspace ${campaign.workspace_id}`);
                return;
            }

            // B. Fetch Audience
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
                    contacts = await prisma.contact.findMany({ where: { workspace_id: workspaceId, blocked: false } });
                }
                recipients = contacts.map(c => ({ phone: c.phone, name: c.name || "Customer", id: c.id }));
            }

            console.log(`[Worker] Found ${recipients.length} recipients.`);

            // C. Update Campaign Stats
            await prisma.campaign.update({
                where: { id: campaignId },
                data: {
                    status: "PROCESSING",
                    stats: {
                        upsert: {
                            create: { total: recipients.length },
                            update: { total: recipients.length }
                        }
                    }
                }
            });

            // D. Iterate and Send
            let sentCount = 0;
            let failedCount = 0;

            for (const person of recipients) {
                try {
                    if (campaign.template_name) {
                        // --- Credit & Reseller Integration ---
                        const countryCode = person.phone.replace(/[^0-9]/g, "").substring(0, 2) || "91";
                        const cost = await CreditService.getMessageCost("MARKETING", countryCode, workspaceId);

                        await prisma.$transaction(async (tx) => {
                            await CreditService.deductCredits(
                                tx,
                                workspaceId,
                                cost,
                                `CAMPAIGN-${campaignId}-${person.id}-${Date.now()}`,
                                `Bulk Campaign: ${campaign.name}`
                            );
                        });

                        await WhatsAppService.sendTemplate(
                            waba.phone_number_id,
                            decrypt(waba.access_token),
                            person.phone,
                            campaign.template_name
                        );
                        sentCount++;
                    } else if (campaign.flow_id) {
                        // FlowRunner handles its own internal credit deduction per node
                        await FlowRunner.startFlow(workspaceId, person.id, campaign.flow_id);
                        sentCount++;
                    }
                } catch (error: any) {
                    console.error(`[Worker] Failed for ${person.phone}:`, error);
                    failedCount++;
                }

                // Batch update stats every 50 messages for live monitoring
                if ((sentCount + failedCount) % 50 === 0) {
                    await prisma.campaignStats.updateMany({
                        where: { campaign_id: campaignId },
                        data: {
                            sent: sentCount,
                            failed: failedCount
                        }
                    });
                }

                if ((sentCount + failedCount) % 100 === 0) {
                    console.log(`[Worker] Progress: ${sentCount + failedCount} / ${recipients.length}`);
                }

                await new Promise(r => setTimeout(r, 5));
            }

            // E. Complete
            await prisma.campaign.update({
                where: { id: campaignId },
                data: {
                    status: "COMPLETED",
                    stats: { update: { sent: sentCount, failed: failedCount } }
                }
            });

        } catch (error) {
            console.error(`[Worker] Campaign Failed`, error);
            await prisma.campaign.update({
                where: { id: campaignId },
                data: { status: "FAILED" }
            });
        }
    },
    { connection: REDIS_CONNECTION }
);

// Worker Lifecycle Events
campaignWorker.on('ready', () => console.log("✅ [Worker] Campaign Worker READY and Listening!"));
campaignWorker.on('error', (err) => console.error("❌ [Worker] Campaign Worker Error:", err));
campaignWorker.on('failed', (job, err) => console.error(`❌ [Worker] Job ${job?.id} Failed:`, err));
campaignWorker.on('active', (job) => console.log(`▶️ [Worker] Job ${job.id} Active (Processing...)`));
campaignWorker.on('stalled', (jobId) => console.warn(`⚠️ [Worker] Job ${jobId} Stalled`));


// ---------------------------------------------------------
// 2. DRIP SCHEDULER (Polling)
// ---------------------------------------------------------
// Check every 60 seconds
const DRIP_INTERVAL = 60000;

async function processDrips() {
    console.log(`[Scheduler] Checking Drips at ${new Date().toISOString()}...`);

    try {
        console.log("[Scheduler] Trace: Attempting findMany on dripEnrollment...");
        // Find enrollments due for processing
        const dueEnrollments = await prisma.dripEnrollment.findMany({
            where: {
                is_stopped: false,
                next_run_at: { lte: new Date() }
            },
            include: {
                drip: { include: { steps: { orderBy: { step_order: 'asc' } } } },
                contact: { include: { workspace: { include: { waba: true } } } }
            },
            take: 50 // Process in batches
        });

        if (dueEnrollments.length === 0) return;

        console.log(`[Scheduler] Found ${dueEnrollments.length} drips to process.`);

        for (const enrollment of dueEnrollments) {
            const { drip, contact, current_step } = enrollment;
            const step = drip.steps[current_step]; // Current step index corresponds to step array index if ordered? 
            // Better: Find step with step_order == current_step + 1 if 1-based, or array index if 0-based.
            // Schema has `step_order` Int. Let's assume array index logic for simplicity but verify order.
            // Logic: `current_step` in Enrollment is the *index* of the step we are about to execute? 
            // OR is it the index of the *last* executed step?
            // "next_run_at" implies we serve the *next* thing.

            // Let's treat `current_step` as the index of the step *to be executed now*.

            if (!step) {
                // End of Drip
                await prisma.dripEnrollment.update({
                    where: { id: enrollment.id },
                    // @ts-ignore
                    data: { is_stopped: true, stop_reason: "COMPLETED" }
                });
                continue;
            }

            const waba = contact.workspace?.waba;
            if (!waba) continue;

            // Execute Step
            try {
                if (step.template_id) {
                    const template = await prisma.template.findUnique({ where: { id: step.template_id } });
                    if (template) {
                        // --- Credit & Reseller Integration ---
                        const countryCode = contact.phone.replace(/[^0-9]/g, "").substring(0, 2) || "91";
                        const cost = await CreditService.getMessageCost("UTILITY", countryCode, contact.workspace_id);

                        try {
                            await prisma.$transaction(async (tx) => {
                                await CreditService.deductCredits(
                                    tx,
                                    contact.workspace_id,
                                    cost,
                                    `DRIP-${enrollment.id}-${step.id}`,
                                    `Drip: ${drip.name} (Step ${current_step + 1})`
                                );
                            });

                            await WhatsAppService.sendTemplate(
                                waba.phone_number_id,
                                decrypt(waba.access_token),
                                contact.phone,
                                template.name
                            );
                        } catch (creditErr: any) {
                            console.error(`[Scheduler] Credit block for drip ${enrollment.id}:`, creditErr.message);
                            continue; // Skip this step if no credits
                        }
                    }
                } else if ((step as any).flow_id) {
                    // Trigger Flow
                    const flow = await prisma.flow.findUnique({ where: { id: (step as any).flow_id } });
                    if (flow) {
                        await FlowRunner.startFlow(
                            contact.workspace_id,
                            contact.id,
                            flow.trigger_keyword || "DRIP_STEP"
                        );
                    }
                }

                // Update Analytics
                // @ts-ignore
                if (prisma.dripStepAnalytics) {
                    // @ts-ignore
                    await prisma.dripStepAnalytics.upsert({
                        where: { step_id: step.id },
                        update: { sent_count: { increment: 1 } },
                        create: { step_id: step.id, sent_count: 1 }
                    });
                }

                // Schedule Next Step
                const nextStepIndex = current_step + 1;
                const nextStep = drip.steps[nextStepIndex];

                if (nextStep) {
                    await prisma.dripEnrollment.update({
                        where: { id: enrollment.id },
                        data: {
                            current_step: nextStepIndex,
                            next_run_at: new Date(Date.now() + nextStep.delay_hours * 60 * 60 * 1000)
                        }
                    });
                } else {
                    // No more steps, mark complete
                    await prisma.dripEnrollment.update({
                        where: { id: enrollment.id },
                        // @ts-ignore
                        data: { is_stopped: true, stop_reason: "COMPLETED", current_step: nextStepIndex }
                    });
                }

            } catch (e) {
                console.error(`[Scheduler] Failed to process enrollment ${enrollment.id}`, e);
            }
        }

    } catch (e) {
        console.error("[Scheduler] Error in loop", e);
    }
}

// Start Scheduler Loop
setInterval(processDrips, DRIP_INTERVAL);

// 3. AUTOMATION WORKER (Phase 8: Abandoned Cart Recovery)
const automationWorker = new Worker(
    "automation-queue",
    async (job) => {
        if (job.name === "abandoned-cart-recovery") {
            const { workspaceId, orderId } = job.data;
            const order = await (prisma as any).commerceOrder.findUnique({
                where: { id: orderId }
            });

            if (order && order.status === "PLACED") {
                // Not converted yet
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

console.log("🚀 Automation Worker (Campaigns + Drips + Commerce) Started");
