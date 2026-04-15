import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { getCurrentUser } from "../../../lib/auth";

export const dynamic = 'force-dynamic';
import { campaignQueue } from "../../../lib/queue";

// POST /api/campaigns - Create and Launch
export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { name, templateName, flowId, segmentId, scheduledAt, variableMapping, headerMediaUrl, retargeting } = await req.json();

        // 1. Create Campaign Record
        const campaign = await prisma.campaign.create({
            data: {
                workspace_id: user.workspaceId,
                name: name || "New Campaign",
                template_name: templateName,
                flow_id: flowId,
                filters: { 
                    segment_id: segmentId,
                    ...(retargeting ? { retarget_campaign_id: retargeting.campaign_id, retarget_type: retargeting.type } : {})
                },
                status: "PROCESSING",
                scheduled_at: scheduledAt ? new Date(scheduledAt) : null,
                variable_mapping: variableMapping || {},
                header_media_url: headerMediaUrl || null,
            } as any,
        });

        // 2. Add to Queue
        let delay = 0;
        if (scheduledAt) {
            // Because browser `datetime-local` passes timezone-less strings (e.g. "2026-04-12T19:24"), 
            // the UTC server misinterprets this as 5.5 hours in the future.
            const parsedTime = new Date(scheduledAt).getTime();
            delay = parsedTime - Date.now();
            if (delay < 0 || delay > 1000 * 60 * 60 * 24 * 365) {
                // If it's negative (in the past) or absurdly far (e.g. they meant past but it calculated positive), run immediately.
                delay = 0;
            }
        }

        console.log(`[API] 🚀 Queuing Campaign ${campaign.id} with delay: ${delay}ms`);

        await campaignQueue.add(
            "send-campaign",
            {
                campaignId: campaign.id,
                workspaceId: user.workspaceId,
                segmentId: segmentId // Pass to worker
            },
            {
                delay: delay > 0 ? delay : 0,
                jobId: `UNROLL-${campaign.id}` // ☢️ IDEMPOTENCY FIX: Prevent double unrolling
            }
        );

        return NextResponse.json({ success: true, campaign });

    } catch (error) {
        console.error("Create Campaign Error:", error);
        return NextResponse.json({ error: "Error creating campaign" }, { status: 500 });
    }
}

// GET /api/campaigns - List
export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const campaigns = await prisma.campaign.findMany({
            where: { workspace_id: user.workspaceId },
            include: { stats: true },
            orderBy: { created_at: "desc" },
        });

        return NextResponse.json({ data: campaigns });
    } catch (error) {
        return NextResponse.json({ error: "Error fetching campaigns" }, { status: 500 });
    }
}
