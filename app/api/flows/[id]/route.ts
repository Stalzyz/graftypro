import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const flow = await prisma.flow.findFirst({
            where: { id: params.id, workspace_id: user.workspaceId }
        });

        if (!flow) {
            return NextResponse.json({ error: "Flow not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true, flow });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { nodes, edges, name, status, trigger_keyword } = body;

        // Validation
        if (nodes && !Array.isArray(nodes)) return NextResponse.json({ error: "Nodes must be an array" }, { status: 400 });
        if (edges && !Array.isArray(edges)) return NextResponse.json({ error: "Edges must be an array" }, { status: 400 });

        // Security: Ensure flow belongs to user's workspace
        const flow = await prisma.flow.findFirst({
            where: { id: params.id, workspace_id: user.workspaceId }
        });

        if (!flow) {
            return NextResponse.json({ error: "Flow not found" }, { status: 404 });
        }

        // FIX #1 (Root Cause): Auto-sync Start Node keyword → flow.trigger_keyword
        // The trigger engine matches against flow.trigger_keyword in the DB.
        // The Flow Builder UI stores the keyword inside the start node's data.text.
        // These were NEVER synced, causing vendor-configured triggers to silently fail.
        // Now: whenever a flow is saved, we extract the start node keyword and write it
        // to trigger_keyword so the engine can find it. explicit trigger_keyword overrides.
        let resolvedTriggerKeyword = trigger_keyword;
        if (!resolvedTriggerKeyword && Array.isArray(nodes)) {
            const startNode = nodes.find((n: any) => n.type === 'start');
            const startKeyword = startNode?.data?.text?.trim();
            if (startKeyword) {
                resolvedTriggerKeyword = startKeyword;
                console.log(`[FlowSave] 🎯 Auto-synced trigger_keyword from start node: "${startKeyword}"`);
            }
        }

        const updatedFlow = await prisma.flow.update({
            where: { id: params.id },
            data: {
                nodes: nodes ?? undefined,
                edges: edges ?? undefined,
                name: name ?? undefined,
                trigger_keyword: resolvedTriggerKeyword ?? undefined,
                status: status ?? undefined,
                updated_at: new Date(),
            },
        });

        return NextResponse.json({ success: true, flow: updatedFlow });
    } catch (error) {
        console.error("Update Flow Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const deleted = await prisma.flow.deleteMany({
            where: { id: params.id, workspace_id: user.workspaceId }
        });

        if (deleted.count === 0) {
            return NextResponse.json({ error: "Flow not found" }, { status: 404 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
