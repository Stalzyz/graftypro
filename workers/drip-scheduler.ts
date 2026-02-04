
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
            const steps = enrollment.drip.steps;
            // Current step logic:
            // If current_step = 0, we look for step_order = 1
            const nextStepOrder = enrollment.current_step + 1;
            const stepToSend = steps.find(s => s.step_order === nextStepOrder);

            if (!stepToSend) {
                // No more steps, mark completed
                console.log(`Drip ${enrollment.drip.name} finished for contact.`);
                await prisma.dripEnrollment.update({
                    where: { id: enrollment.id },
                    data: { is_stopped: true }
                });
                continue;
            }

            // 2. Safety Check (Goal Awareness)
            if (enrollment.drip.goal_id) {
                // Optional: Check if goal is already achieved.
            }

            // 3. Send Message
            let sentSuccess = false;

            if (enrollment.contact.phone) {
                // Fetch WABA ID via workspace_id
                const waba = await prisma.whatsAppAccount.findUnique({
                    where: { workspace_id: enrollment.drip.workspace_id }
                });

                // Fetch Template Details
                let template = null;
                if (stepToSend.template_id) {
                    template = await prisma.template.findUnique({
                        where: { id: stepToSend.template_id }
                    });
                }

                if (waba && template) {
                    try {
                        await WhatsAppService.sendTemplate(
                            waba.phone_number_id,
                            waba.access_token,
                            enrollment.contact.phone,
                            template.name,
                            template.language
                        );
                        console.log(`Sent Drip Step ${stepToSend.step_order} to ${enrollment.contact.phone}`);
                        sentSuccess = true;
                    } catch (err) {
                        console.error("Failed to send message", err);
                    }
                } else {
                    console.log(`Skipping Step ${stepToSend.step_order}: WABA or Template missing.`);
                }
            }

            // 4. Update Enrollment (Schedule Next)
            // Even if send failed? Usually yes, to avoid stuck loops, or setup retry.
            // For MVP, we advance.

            const nextNextStep = steps.find(s => s.step_order === nextStepOrder + 1);

            if (nextNextStep) {
                // Schedule next run
                const nextRun = new Date(now.getTime() + nextNextStep.delay_hours * 60 * 60 * 1000);
                await prisma.dripEnrollment.update({
                    where: { id: enrollment.id },
                    data: {
                        current_step: nextStepOrder,
                        next_run_at: nextRun
                    }
                });
            } else {
                // Done
                await prisma.dripEnrollment.update({
                    where: { id: enrollment.id },
                    data: {
                        current_step: nextStepOrder,
                        is_stopped: true // Finished
                    }
                });
            }

        } catch (e) {
            console.error(`Failed to process drip for ${enrollment.id}`, e);
        }
    }
}

// Run loop
// Process drips immediately on start, then interval
processDrips();
setInterval(processDrips, 60000); // Check every minute
console.log("🌊 Drip Scheduler Started");
