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
            // Meta API enforces strict naming: lowercase, alphanumeric, max 60 chars.
            // MUST be unique across the entire WhatsApp Business Account.
            const uniqueSuffix = Date.now().toString(36);
            let baseName = (name || "new_flow")
                .toLowerCase()
                .replace(/[^a-z0-9_]/g, '_')
                .replace(/_+/g, '_')
                .replace(/^_|_$/g, '');
            baseName = baseName.substring(0, 50) || "new_flow"; // Keep room for suffix
            const sanitizedName = `${baseName}_${uniqueSuffix}`;

            console.log(`[FlowSync] Creating new flow: ${sanitizedName}`);
            finalFlowId = await MetaFlowService.createFlow(workspaceId, sanitizedName);
        }

        // 2. Update Spec (UPLOAD ASSET)
        console.log(`[FlowSync] Uploading spec to flow: ${finalFlowId}`);
        console.log(`[FlowSync] Spec keys:`, Object.keys(spec || {}));
        
        if (!spec || Object.keys(spec).length === 0) {
            return NextResponse.json({ success: false, error: "Cannot sync: spec is empty. Add form fields first." }, { status: 400 });
        }
        
        await MetaFlowService.updateSpec(workspaceId, finalFlowId, spec);


        // 3. Publish Flow (GO LIVE)
        console.log(`[FlowSync] Publishing flow: ${finalFlowId}`);
        let publishWarning = null;
        try {
            await MetaFlowService.publishFlow(workspaceId, finalFlowId);
        } catch (e: any) {
            console.error(`[FlowSync] Publish Failed:`, e.message);
            publishWarning = e.message;
        }

        // 4. Mark in DB (local sync) - Note: meta_flow_id might not be set natively yet
        if (!publishWarning) {
            await (prisma as any).flow.updateMany({
                where: { meta_flow_id: finalFlowId },
                data: { meta_flow_status: "PUBLISHED" }
            });
        }

        return NextResponse.json({ 
            success: true, 
            metaFlowId: finalFlowId,
            warning: publishWarning
        });

    } catch (error: any) {
        console.error(`[FlowSync] Error:`, error.message);
        return NextResponse.json({ 
            success: false, 
            error: error.message 
        }, { status: 500 });
    }
}
