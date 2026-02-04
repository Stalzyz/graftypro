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
            // current_step is 0-indexed index of LAST completed step? 
            // Let's say current_step 0 means "Just started, ready for Step 1".
            // If we want 1-based logic:
            const nextStepOrder = enrollment.current_step + 1;
            const stepToSend = steps.find(s => s.step_order === nextStepOrder);

            if (!stepToSend) {
                // No more steps, mark completed
                // But strictly, we check status.
                console.log(`Drip ${enrollment.drip.name} finished for contact.`);
                // Could delete enrollment or mark finished
                continue;
            }

            // 2. Safety Check (Goal Awareness)
            if (enrollment.drip.goal_id) {
                // Check if goal is achieved for this contact
                // (Requires tracking goal completion per contact - usually stored in GoalMetric or FlowSession)
                // For MVP, we skip this deep check, assuming Flow would have set 'is_stopped' = true upon completion.
            }

            // 3. Send Message
            if (enrollment.contact.phone_number_id) {
                // Need WABA ID. Contact model doesn't have it directly.
                // In real app, fetch WABA via workspace_id
                const waba = await prisma.whatsAppAccount.findUnique({
                    where: { workspace_id: enrollment.drip.workspace_id }
                });

                if (waba && stepToSend.template_id) {
                    await WhatsAppService.sendTemplate(
                        waba.phone_number_id,
                        waba.access_token,
                        enrollment.contact.phone,
                        stepToSend.template_id
                    );
                    console.log(`Sent Drip Step ${stepToSend.step_order} to ${enrollment.contact.phone}`);
                }
            }

            // 4. Update Enrollment (Schedule Next)
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
setInterval(processDrips, 60000); // Check every minute
console.log("🌊 Drip Scheduler Started");
