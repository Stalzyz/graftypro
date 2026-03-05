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

        const { name, templateName, flowId, segmentId, scheduledAt } = await req.json();

        // 1. Create Campaign Record
        const campaign = await prisma.campaign.create({
            data: {
                workspace_id: user.workspaceId,
                name: name || "New Campaign",
                template_name: templateName,
                flow_id: flowId,
                filters: { segment_id: segmentId },
                status: "PROCESSING",
                scheduled_at: scheduledAt ? new Date(scheduledAt) : null,
            },
        });

        // 2. Add to Queue
        const delay = scheduledAt ? new Date(scheduledAt).getTime() - Date.now() : 0;

        await campaignQueue.add(
            "send-campaign",
            {
                campaignId: campaign.id,
                workspaceId: user.workspaceId,
                segmentId: segmentId // Pass to worker
            },
            {
                delay: delay > 0 ? delay : 0,
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
