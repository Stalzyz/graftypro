import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";
import { campaignQueue } from "../../../../lib/queue";

export const dynamic = 'force-dynamic';

/**
 * 🔁 BROADCAST RECOVERY ENGINE
 * 
 * POST /api/campaigns/recover
 * 
 * Finds campaigns stuck in PROCESSING state (worker crashed after Bug #1: isActive missing)
 * and re-queues them for dispatch. Safe to call multiple times — idempotency key prevents
 * double-unrolling.
 * 
 * Body: { campaignId?: string }  — optional, recovers ALL stuck if omitted
 * 
 * ☢️ Root Cause: CampaignStatusCache.isActive() was missing, crashing every
 * campaign worker job on the first batch iteration. This route recovers historical
 * stuck campaigns after that fix is deployed.
 */
export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json().catch(() => ({}));
        const { campaignId } = body;

        const stuckThresholdMs = 10 * 60 * 1000; // Campaigns PROCESSING > 10 mins are stuck
        const stuckCutoff = new Date(Date.now() - stuckThresholdMs);

        const stuckCampaigns = await prisma.campaign.findMany({
            where: {
                workspace_id: user.workspaceId,
                status: { in: ["PROCESSING", "DRAFT"] },
                updated_at: { lt: stuckCutoff }, // Not updated in last 10 minutes
                scheduled_at: null, // Only recover manual broadcasts, not future schedules
                ...(campaignId ? { id: campaignId } : {})
            },
            include: { stats: true },
            orderBy: { created_at: "desc" },
            take: 50
        });

        if (stuckCampaigns.length === 0) {
            return NextResponse.json({ 
                success: true, 
                message: "No stuck campaigns found.",
                recovered: 0 
            });
        }

        const recovered: string[] = [];
        const failed: { id: string, error: string }[] = [];

        for (const campaign of stuckCampaigns) {
            try {
                // Check if the campaign has any stats (if total > 0 and processed == total, it should be COMPLETED)
                const stats = campaign.stats;
                if (stats && stats.total > 0) {
                    const processed = (stats.sent || 0) + (stats.failed || 0);
                    if (processed >= stats.total) {
                        // Campaign is actually done — just missed the COMPLETED transition
                        await prisma.campaign.update({
                            where: { id: campaign.id },
                            data: { status: "COMPLETED" }
                        });
                        console.log(`[Recovery] ✅ Campaign ${campaign.id} auto-completed (${processed}/${stats.total})`);
                        recovered.push(campaign.id);
                        continue;
                    }
                }

                // Reset to DRAFT and re-enqueue (idempotency key prevents double-unrolling)
                await prisma.campaign.update({
                    where: { id: campaign.id },
                    data: { status: "DRAFT" }
                });

                // Try to re-add to queue with idempotency key
                // BullMQ will reject if the job already exists in an active state
                await campaignQueue.add(
                    "send-campaign",
                    {
                        campaignId: campaign.id,
                        workspaceId: campaign.workspace_id,
                        segmentId: (campaign.filters as any)?.segment_id
                    },
                    {
                        jobId: `RECOVER-${campaign.id}-${Date.now()}`, // New ID to force re-queue
                        attempts: 5,
                        backoff: { type: "exponential", delay: 5000 }
                    }
                );

                await prisma.campaign.update({
                    where: { id: campaign.id },
                    data: { status: "PROCESSING" }
                });

                console.log(`[Recovery] 🔁 Campaign ${campaign.id} re-queued successfully.`);
                recovered.push(campaign.id);

            } catch (err: any) {
                console.error(`[Recovery] ❌ Failed to recover campaign ${campaign.id}:`, err.message);
                failed.push({ id: campaign.id, error: err.message });
            }
        }

        return NextResponse.json({
            success: true,
            recovered: recovered.length,
            failed: failed.length,
            recovered_ids: recovered,
            failed_details: failed
        });

    } catch (error: any) {
        console.error("Campaign Recovery Error:", error);
        return NextResponse.json({ error: error.message || "Recovery failed" }, { status: 500 });
    }
}

/**
 * GET /api/campaigns/recover
 * Diagnostic: List all stuck PROCESSING campaigns without recovering them
 */
export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const stuckCutoff = new Date(Date.now() - 10 * 60 * 1000);

        const stuck = await prisma.campaign.findMany({
            where: {
                workspace_id: user.workspaceId,
                status: "PROCESSING",
                updated_at: { lt: stuckCutoff }
            },
            include: { stats: true },
            orderBy: { created_at: "desc" }
        });

        const draft = await prisma.campaign.findMany({
            where: {
                workspace_id: user.workspaceId,
                status: "DRAFT"
            },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json({
            stuck_processing: stuck.length,
            draft_unqueued: draft.length,
            campaigns: stuck.map(c => ({
                id: c.id,
                name: c.name,
                status: c.status,
                created_at: c.created_at,
                updated_at: c.updated_at,
                stats: c.stats ? {
                    total: c.stats.total,
                    sent: c.stats.sent,
                    failed: c.stats.failed,
                    processed: (c.stats.sent || 0) + (c.stats.failed || 0)
                } : null
            }))
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
