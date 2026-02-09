
import { prisma } from "../lib/db";
import { WhatsAppService } from "../lib/whatsapp/service";

/**
 * Run this every minute via Cron or setInterval
 */
async function processDrips() {
    console.log("Checking for due drips...");

    const now = new Date();

    // 1. Find Due Enrollments
    const dueEnrollments = await prisma.dripEnrollment.findMany({
        where: {
            next_run_at: { lte: now },
            is_stopped: false,
        },
        include: {
            drip: {
                include: { steps: { orderBy: { step_order: "asc" } } }
            },
            contact: true,
        },
    });

    console.log(`Found ${dueEnrollments.length} due enrollments.`);

    for (const enrollment of dueEnrollments) {
        try {
            const drip = enrollment.drip;
            // @ts-ignore
            const settings = (drip.settings as any) || {};

            // 1. Business Hours & Day Check
            if (settings.business_hours) {
                const tz = settings.timezone || "UTC";
                const nowInTz = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
                const hour = nowInTz.getHours();
                const day = nowInTz.getDay(); // 0-6 (Sun-Sat)

                const startHour = settings.start_hour || 9;
                const endHour = settings.end_hour || 18;
                const allowedDays = settings.days || [1, 2, 3, 4, 5]; // Mon-Fri default

                if (hour < startHour || hour >= endHour || !allowedDays.includes(day)) {
                    console.log(`Drip step paused for ${enrollment.contact.phone}: Outside business hours.`);
                    // Push next_run_at to tomorrow morning
                    const tomorrow = new Date();
                    tomorrow.setDate(tomorrow.getDate() + 1);
                    tomorrow.setHours(startHour, 0, 0, 0);

                    await prisma.dripEnrollment.update({
                        where: { id: enrollment.id },
                        data: { next_run_at: tomorrow }
                    });
                    continue;
                }
            }

            const steps = enrollment.drip.steps;
            const nextStepOrder = enrollment.current_step + 1;
            const stepToSend = steps.find(s => s.step_order === nextStepOrder);

            if (!stepToSend) {
                await prisma.dripEnrollment.update({
                    where: { id: enrollment.id },
                    // @ts-ignore
                    data: { is_stopped: true, stop_reason: "SEQUENCE_COMPLETED" }
                });
                continue;
            }

            // 2. Goal Check (Automatic Stop)
            if (drip.goal_id) {
                const goalAchieved = false; // TODO: Implement specific goal achievement check if needed
                if (goalAchieved) {
                    await prisma.dripEnrollment.update({
                        where: { id: enrollment.id },
                        // @ts-ignore
                        data: {
                            is_stopped: true,
                            // @ts-ignore
                            stop_reason: "GOAL_ACHIEVED"
                        }
                    });
                    continue;
                }
            }

            // 3. 24-Hour Window & Meta Compliance
            // @ts-ignore
            const lastActive = enrollment.contact.last_active_at;
            const isInsideWindow = (now.getTime() - lastActive.getTime()) < (24 * 60 * 60 * 1000);

            // Fetch WABA ID via workspace_id
            const waba = await prisma.whatsAppAccount.findUnique({
                where: { workspace_id: drip.workspace_id }
            });

            if (!waba) continue;

            let sentSuccess = false;

            // CONTENT LOGIC
            // @ts-ignore
            if (stepToSend.flow_id) {
                if (!isInsideWindow) {
                    console.log(`Contact ${enrollment.contact.phone} outside 24h window. Cannot trigger Flow.`);
                    // Optional: Fallback to a template if configured in settings?
                    // For now, we skip or alert.
                } else {
                    try {
                        const { FlowRunner } = await import("../lib/engine/flow-runner");
                        const session = await prisma.flowSession.create({
                            data: {
                                // @ts-ignore
                                flow_id: stepToSend.flow_id,
                                contact_id: enrollment.contact_id,
                                state: { triggered_by: "drip", drip_id: enrollment.drip_id }
                            },
                            include: { flow: true }
                        });
                        await FlowRunner.executeNextStep(session, null);
                        sentSuccess = true;
                    } catch (err) { console.error(err); }
                }
                // @ts-ignore
            } else if (stepToSend.template_id) {
                // Templates can be sent OUTSIDE window
                const template = await prisma.template.findUnique({
                    // @ts-ignore
                    where: { id: stepToSend.template_id }
                });

                if (template) {
                    try {
                        await WhatsAppService.sendTemplate(
                            waba.phone_number_id, waba.access_token, enrollment.contact.phone,
                            template.name, template.language
                        );
                        sentSuccess = true;
                    } catch (err) { console.error(err); }
                }
            }

            if (sentSuccess) {
                // Track Analytics
                const { DripService } = await import("../lib/services/drip-service");
                await DripService.trackSent(stepToSend.id);

                // Update Enrollment (Schedule Next)
                const nextNextStep = steps.find(s => s.step_order === nextStepOrder + 1);
                if (nextNextStep) {
                    const nextRun = new Date(now.getTime() + nextNextStep.delay_hours * 60 * 60 * 1000);
                    await prisma.dripEnrollment.update({
                        where: { id: enrollment.id },
                        data: {
                            current_step: nextStepOrder,
                            next_run_at: nextRun,
                            // @ts-ignore
                            metadata: enrollment.metadata, // Assuming metadata exists on enrollment
                            // @ts-ignore
                            stop_on_reply: enrollment.stop_on_reply // Assuming stop_on_reply exists on enrollment
                        }
                    });
                } else {
                    await prisma.dripEnrollment.update({
                        where: { id: enrollment.id },
                        data: {
                            current_step: nextStepOrder,
                            // @ts-ignore
                            is_stopped: true,
                            // @ts-ignore
                            stop_reason: "SEQUENCE_COMPLETED"
                        }
                    });
                }
            }

        } catch (e) {
            console.error(`Failed to process drip for ${enrollment.id}`, e);
        }
    }

    // --- RESUME WAITING FLOW SESSIONS ---
    const waitingSessions = await prisma.flowSession.findMany({
        where: {
            // @ts-ignore
            is_waiting: true,
            // @ts-ignore
            next_run_at: { lte: now }
        }
    });

    console.log(`Found ${waitingSessions.length} waiting flow sessions to resume.`);

    for (const session of waitingSessions) {
        try {
            const { FlowRunner } = await import("../lib/engine/flow-runner");

            // 1. Mark as not waiting
            await prisma.flowSession.update({
                where: { id: session.id },
                // @ts-ignore
                data: { is_waiting: false }
            });

            // 2. Execute next step (moving from the 'wait' node target)
            await FlowRunner.executeNextStep(session, session.current_node_id);
            console.log(`Resumed Flow Session ${session.id}`);

        } catch (e) {
            console.error(`Failed to resume flow session ${session.id}`, e);
        }
    }
}
// Run loop
// Process drips immediately on start, then interval
processDrips();
setInterval(processDrips, 60000); // Check every minute
console.log("🌊 Drip Scheduler Started");
