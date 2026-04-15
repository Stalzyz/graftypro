import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { CampaignStatusCache } from "@/lib/redis-status";

/**
 * PATCH /api/campaigns/[id]/status
 * Dedicated endpoint for real-time control (PAUSE, STOP, RESUME)
 */
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = params;
        const { status } = await req.json();

        // 1. Validation
        if (!["PAUSED", "CANCELLED", "PROCESSING"].includes(status)) {
            return NextResponse.json({ error: "Invalid status transition" }, { status: 400 });
        }

        // 2. Fetch campaign to verify ownership and current state
        const campaign = await prisma.campaign.findUnique({
            where: { id, workspace_id: user.workspaceId }
        });

        if (!campaign) {
            return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
        }

        // Prevent modification of finished campaigns
        if (["COMPLETED", "FAILED"].includes(campaign.status)) {
            return NextResponse.json({ error: "Cannot modify a finished campaign" }, { status: 400 });
        }

        // 3. Update Status in DB
        const updatedCampaign = await prisma.campaign.update({
            where: { id },
            data: { status: status as any }
        });

        // ☢️ NUCLEAR CONTROL SYNC: Update Redis Cache for Instant Worker Reaction
        if (status === "CANCELLED") {
            await CampaignStatusCache.delete(id);
            await CampaignStatusCache.set(id, "CANCELLED"); // Explicit for discarding
        } else {
            await CampaignStatusCache.set(id, status);
        }

        console.log(`[Campaign Control] 🕹️ Workspace ${user.workspaceId} changed campaign ${id} status to ${status} (Redis Synced)`);

        return NextResponse.json({ 
            success: true, 
            status: updatedCampaign.status,
            message: `Campaign ${status.toLowerCase()} successfully.`
        });

    } catch (error: any) {
        console.error("[Campaign Status API Error]:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
