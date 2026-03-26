
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { WhatsAppService } from "../../../../lib/whatsapp/service";
import { decrypt } from "../../../../lib/security/encryption";

// Ensure this isn't cached as it needs to run on schedule
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const authHeader = req.headers.get("Authorization");
        if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return NextResponse.json({ error: "Unauthorized Cron" }, { status: 401 });
        }

        const now = new Date();

        // 1. Find due enrollments
        // Limit to 50 to ensure execution within timeout limits
        const enrollments = await prisma.dripEnrollment.findMany({
            where: {
                next_run_at: {
                    lte: now
                },
                is_stopped: false
            },
            take: 50,
            include: {
                contact: true,
                drip: {
                    include: {
                        workspace: {
                            include: { waba: true }
                        },
                        steps: {
                            orderBy: { step_order: 'asc' }
                        }
                    }
                }
            }
        });

        if (enrollments.length === 0) {
            return NextResponse.json({ message: "No due drips found", count: 0 });
        }

        const results = [];

        for (const enrollment of enrollments) {
            try {
                const { drip, contact } = enrollment;
                const workspace = drip.workspace;
                const waba = workspace.waba;

                // Validate WABA Credentials
                if (!waba || !waba.access_token || !waba.phone_number_id) {
                    console.warn(`Missing WABA for workspace ${workspace.id}`);
                    results.push({ id: enrollment.id, status: "skipped_no_waba" });
                    continue;
                }

                // Check Subscription/Balance logic here if needed

                // Identify the step to run
                const currentStepOrder = enrollment.current_step;
                const nextStepOrder = currentStepOrder + 1;

                // Find the step definition
                const stepToRun = drip.steps.find(s => s.step_order === nextStepOrder);

                if (!stepToRun) {
                    // No more steps found for this order. 
                    // This implies the sequence is complete.
                    await prisma.dripEnrollment.update({
                        where: { id: enrollment.id },
                        data: { is_stopped: true }
                    });
                    results.push({ id: enrollment.id, status: "completed_sequence_end" });
                    continue;
                }

                // Get Template Data
                if (!stepToRun.template_id) {
                    // Step has no template? Skip or Error.
                    // If it's a delay-only step (not supported by schema yet), we might just advance.
                    // For now, schema implies template_id is used.
                    results.push({ id: enrollment.id, status: "skipped_no_template" });
                    continue;
                }

                const template = await prisma.template.findUnique({
                    where: { id: stepToRun.template_id }
                });

                if (!template) {
                    // Template deleted? Stop drip to be safe.
                    await prisma.dripEnrollment.update({
                        where: { id: enrollment.id },
                        data: { is_stopped: true }
                    });
                    results.push({ id: enrollment.id, status: "stopped_template_missing" });
                    continue;
                }

                // EXECUTE SEND
                // Note: interactive components/variables support would go here
                const token = decrypt(waba.access_token);
                await WhatsAppService.sendTemplate(
                    waba.phone_number_id,
                    token,
                    contact.phone,
                    template.name,
                    template.language,
                    [],
                    workspace.id,
                    "MARKETING",
                    "Automated Drip Sequence"
                );

                // Determine Future Run
                const futureStepOrder = nextStepOrder + 1;
                const futureStep = drip.steps.find(s => s.step_order === futureStepOrder);

                if (futureStep) {
                    const nextDate = new Date();
                    // Add delay (in hours)
                    nextDate.setHours(nextDate.getHours() + futureStep.delay_hours);

                    await prisma.dripEnrollment.update({
                        where: { id: enrollment.id },
                        data: {
                            current_step: nextStepOrder,
                            next_run_at: nextDate
                        }
                    });
                    results.push({ id: enrollment.id, status: "sent_advanced", step: nextStepOrder });
                } else {
                    // Valid send, but no future steps -> Complete
                    await prisma.dripEnrollment.update({
                        where: { id: enrollment.id },
                        data: {
                            current_step: nextStepOrder,
                            is_stopped: true
                        }
                    });
                    results.push({ id: enrollment.id, status: "sent_completed", step: nextStepOrder });
                }



            } catch (e) {
                console.error(`Failed to process enrollment ${enrollment.id}`, e);
                results.push({ id: enrollment.id, status: "failed_execution" });
            }
        }

        return NextResponse.json({
            success: true,
            processed_count: results.length,
            results
        });

    } catch (error) {
        console.error("Drip Cron Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
