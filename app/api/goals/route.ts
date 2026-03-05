import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { getCurrentUser } from "../../../lib/auth";
import { GOAL_TEMPLATES } from "../../../lib/goals/templates";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, type, config } = await req.json();

        if (!type || !GOAL_TEMPLATES[type as keyof typeof GOAL_TEMPLATES]) {
            return NextResponse.json({ error: "Invalid Goal Type" }, { status: 400 });
        }

        // 1. Generate the Flow Structure based on the Goal
        const template = GOAL_TEMPLATES[type as keyof typeof GOAL_TEMPLATES];
        // Cast strict type
        const templateFn = template.generate as Function;

        // Pass config params (e.g. business name) or defaults
        const generatedFlow = templateFn(user.workspaceId, config);

        // 2. Transaction: Create Goal + Flow
        const result = await prisma.$transaction(async (tx) => {
            // Create Flow first
            const flow = await tx.flow.create({
                data: {
                    workspace_id: user.workspaceId,
                    name: `${name} (Auto-Flow)`,
                    trigger_keyword: "start_goal_" + Date.now(), // Internal trigger
                    status: "PUBLISHED", // Auto-publish for the goal
                    nodes: generatedFlow.nodes,
                    edges: generatedFlow.edges
                }
            });

            // Create Goal
            const goal = await tx.goal.create({
                data: {
                    workspace_id: user.workspaceId,
                    name: name,
                    type: type,
                    config: config || {},
                    flow_id: flow.id,
                    status: "ACTIVE"
                }
            });

            return { goal, flow };
        });

        return NextResponse.json({ success: true, ...result });

    } catch (error) {
        console.error("Create Goal Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const goals = await prisma.goal.findMany({
            where: { workspace_id: user.workspaceId },
            include: {
                metrics: {
                    orderBy: { date: 'desc' },
                    take: 1
                }
            },
            orderBy: { updated_at: "desc" },
        });

        return NextResponse.json({ data: goals });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
