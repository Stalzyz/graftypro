
import { prisma } from "../db";

export class DripService {

    /**
     * Enroll a contact into a drip sequence.
     */
    static async enroll(workspaceId: string, contactId: string, dripId: string, metadata: any = {}) {
        const drip = await prisma.dripSequence.findUnique({
            where: { id: dripId },
            include: { steps: { orderBy: { step_order: "asc" } } }
        });

        if (!drip || drip.status !== "ACTIVE") return null;

        const firstStep = drip.steps[0];
        if (!firstStep) return null;

        // Schedule first step
        const nextRun = new Date(Date.now() + firstStep.delay_hours * 60 * 60 * 1000);

        // Check if already enrolled in this drip and not stopped
        const existing = await prisma.dripEnrollment.findFirst({
            where: {
                contact_id: contactId,
                drip_id: dripId,
                is_stopped: false
            }
        });

        if (existing) {
            console.log(`Contact ${contactId} already enrolled in drip ${dripId}`);
            return existing;
        }

        return await prisma.dripEnrollment.create({
            data: {
                drip_id: dripId,
                contact_id: contactId,
                next_run_at: nextRun,
                current_step: 0,
                metadata: metadata // JSON type
            }
        });
    }

    /**
     * Stop all drips for a contact associated with a specific goal.
     */
    static async stopForGoal(contactId: string, goalId: string) {
        return await prisma.dripEnrollment.updateMany({
            where: {
                contact_id: contactId,
                is_stopped: false,
                drip: { goal_id: goalId }
            },
            data: {
                is_stopped: true,
                stop_reason: "GOAL_ACHIEVED"
            }
        });
    }

    /**
     * Stop a specific enrollment.
     */
    static async stopEnrollment(enrollmentId: string, reason: string = "MANUALLY_STOPPED") {
        return await prisma.dripEnrollment.update({
            where: { id: enrollmentId },
            data: {
                is_stopped: true,
                stop_reason: reason
            }
        });
    }

    /**
     * Track Step Analytics (Sent)
     */
    static async trackSent(stepId: string) {
        return await prisma.dripStepAnalytics.upsert({
            where: { step_id: stepId },
            update: { sent_count: { increment: 1 } },
            create: { step_id: stepId, sent_count: 1 }
        });
    }

    /**
     * Track Step Analytics (Read)
     */
    static async trackRead(stepId: string) {
        return await prisma.dripStepAnalytics.upsert({
            where: { step_id: stepId },
            update: { read_count: { increment: 1 } },
            create: { step_id: stepId, read_count: 1 } // Create if missing
        });
    }
}
