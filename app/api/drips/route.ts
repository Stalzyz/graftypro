import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, steps } = body; // steps: [{ template_id, delay_hours, step_order }]

        // Transaction to create Drip + Steps
        const drip = await prisma.$transaction(async (tx) => {
            const newDrip = await tx.dripSequence.create({
                data: {
                    workspace_id: user.workspaceId,
                    name: name,
                    status: "ACTIVE",
                }
            });

            if (steps && steps.length > 0) {
                await tx.dripStep.createMany({
                    data: steps.map((s: any) => ({
                        drip_id: newDrip.id,
                        step_order: s.step_order,
                        delay_hours: s.delay_hours,
                        template_id: s.template_id,
                    }))
                });
            }

            return newDrip;
        });

        return NextResponse.json({ success: true, drip });
    } catch (error) {
        console.error("Create Drip Error:", error);
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
            include: { steps: { orderBy: { step_order: 'asc' } } },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json({ data: drips });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
