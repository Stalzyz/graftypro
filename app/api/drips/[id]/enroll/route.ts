
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { contact_ids } = body;

        if (!contact_ids || !Array.isArray(contact_ids) || contact_ids.length === 0) {
            return NextResponse.json({ error: "Invalid contact_ids provided" }, { status: 400 });
        }

        const dripId = params.id;

        // 1. Verify Drip belongs to workspace
        const drip = await prisma.dripSequence.findFirst({
            where: {
                id: dripId,
                workspace_id: user.workspaceId
            },
            include: {
                steps: {
                    orderBy: { step_order: 'asc' },
                    take: 1
                }
            }
        });

        if (!drip) {
            return NextResponse.json({ error: "Drip sequence not found" }, { status: 404 });
        }

        // 2. Determine initial run time
        // If there are no steps, we can't really run anything, but we can enroll them.
        // If there is a first step, check its delay.
        let initialDelayHours = 0;
        if (drip.steps.length > 0) {
            initialDelayHours = drip.steps[0].delay_hours;
        }

        const nextRunAt = new Date();
        // Add delay hours to current time
        // If delay is 0, it runs "immediately" (next cron tick)
        nextRunAt.setHours(nextRunAt.getHours() + initialDelayHours);

        // 3. Create Enrollments
        // We use createMany and skipDuplicates to report success safely
        const enrollmentsData = contact_ids.map((contactId) => ({
            drip_id: dripId,
            contact_id: contactId,
            current_step: 0, // No steps completed yet
            next_run_at: nextRunAt,
            is_stopped: false
        }));

        await prisma.dripEnrollment.createMany({
            data: enrollmentsData,
            skipDuplicates: true,
        });

        return NextResponse.json({
            success: true,
            message: `Enrolled ${contact_ids.length} contacts into trip`,
            scheduled_start: nextRunAt
        });

    } catch (error) {
        console.error("Drip Enrollment Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
