import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { getCurrentUser } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { id, name, description, goal_id, stop_on_reply, settings, steps } = body;

        const drip = await prisma.$transaction(async (tx) => {
            const data: any = {
                workspace_id: user.workspaceId,
                name,
                description,
                goal_id: goal_id || null, // Ensure null if empty string
                stop_on_reply: stop_on_reply ?? true,
                settings: settings || {},
                status: "ACTIVE",
            };

            let dripObj;
            if (id) {
                dripObj = await tx.dripSequence.update({
                    where: { id, workspace_id: user.workspaceId },
                    data
                });
                // Clear existing steps for re-creation (simplified update)
                await tx.dripStep.deleteMany({ where: { drip_id: id } });
            } else {
                dripObj = await tx.dripSequence.create({ data });
            }

            if (steps && steps.length > 0) {
                for (const s of steps) {
                    await tx.dripStep.create({
                        data: {
                            drip_id: dripObj.id,
                            step_order: parseInt(s.step_order),
                            delay_hours: parseInt(s.delay_hours),
                            flow_id: s.flow_id || null,
                            template_id: s.template_id || null,
                        }
                    });
                }
            }
            return dripObj;
        });

        return NextResponse.json({ success: true, drip });
    } catch (error) {
        console.error("Drip Save Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const drips = await prisma.dripSequence.findMany({
            where: { workspace_id: user.workspaceId },
            include: {
                steps: {
                    orderBy: { step_order: 'asc' },
                    // @ts-ignore
                    include: { analytics: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        // Compute aggregated analytics for each drip
        // @ts-ignore
        const dripsWithAnalytics = drips.map((drip: any) => {
            const totals = drip.steps.reduce((acc: any, step: any) => ({
                sent_count: acc.sent_count + (step.analytics?.sent_count || 0),
                read_count: acc.read_count + (step.analytics?.read_count || 0),
                click_count: acc.click_count + (step.analytics?.click_count || 0),
            }), { sent_count: 0, read_count: 0, click_count: 0 });

            return {
                ...drip,
                analytics: totals
            };
        });

        return NextResponse.json({ data: dripsWithAnalytics });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await prisma.$transaction([
            prisma.dripEnrollment.updateMany({
                where: { drip_id: id },
                data: { is_stopped: true }
            }),
            prisma.dripSequence.delete({
                where: { id, workspace_id: user.workspaceId }
            })
        ]);

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
