import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { MetaFlowService } from '@/lib/whatsapp/flows-service';
import { prisma } from '@/lib/db';

/**
 * 🛰️ META FLOW SYNC API
 * Securely bridges the Flow Builder to Meta's Graph API.
 */
export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user || !user.workspaceId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { flowId, spec, name } = body;
        const workspaceId = user.workspaceId;

        let finalFlowId = flowId;

        // 1. Create Flow if no ID exists
        if (!finalFlowId) {
            console.log(`[FlowSync] Creating new flow: ${name}`);
            finalFlowId = await MetaFlowService.createFlow(workspaceId, name);
        }

        // 2. Update Spec (UPLOAD ASSET)
        console.log(`[FlowSync] Uploading spec to flow: ${finalFlowId}`);
        await MetaFlowService.updateSpec(workspaceId, finalFlowId, spec);

        // 3. Mark in DB (local sync)
        await (prisma as any).flow.updateMany({
            where: { meta_flow_id: finalFlowId },
            data: { meta_flow_status: "DRAFT_UPLOADED" }
        });

        return NextResponse.json({ 
            success: true, 
            metaFlowId: finalFlowId 
        });

    } catch (error: any) {
        console.error(`[FlowSync] Error:`, error.message);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
