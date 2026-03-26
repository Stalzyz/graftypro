import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { FlowGenerator, SimpleFlow } from "@/lib/engine/flow-generator";
import { validateFlowData } from "@/lib/engine/node-validator";

export const dynamic = 'force-dynamic';

/**
 * 🔥 AI FLOW INJECTOR API
 * Allows anyone (or an AI) to easily create flows from a simplified JSON script.
 */
export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body: SimpleFlow = await req.json();

        // 🏗️ Generate the complex React Flow schema
        const generatedFlow = FlowGenerator.generate(body);

        // 🛡️ Pre-Validation Check
        const validation = validateFlowData(generatedFlow.nodes, generatedFlow.edges);
        if (!validation.valid) {
            return NextResponse.json({ 
                error: "Flow Schema Validation Failed", 
                details: validation.errors 
            }, { status: 400 });
        }

        // 💾 Save to Database
        const flow = await prisma.flow.create({
            data: {
                workspace_id: user.workspaceId,
                name: generatedFlow.name || "AI Generated Flow",
                trigger_keyword: generatedFlow.trigger_keyword,
                nodes: generatedFlow.nodes,
                edges: generatedFlow.edges,
                status: generatedFlow.status as any || "PUBLISHED",
            },
        });

        return NextResponse.json({ 
            success: true, 
            message: "Flow injected successfully! 🚀",
            flow_id: flow.id,
            nodes_count: generatedFlow.nodes.length,
            edges_count: generatedFlow.edges.length
        });

    } catch (error: any) {
        console.error("AI Flow Injector Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error", details: error.message },
            { status: 500 }
        );
    }
}
