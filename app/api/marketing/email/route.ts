export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { BulkEmailEngine } from '@/lib/email/bulk-engine';
import { CampaignStatus } from '@prisma/client';

/**
 * 🛰️ Grafty Email Hub: Campaigns API
 * Handles the creation and management of bulk email marketing blasts.
 */

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user || !user.workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const campaigns = await (prisma as any).emailCampaign.findMany({
            where: { workspace_id: user.workspaceId },
            include: { stats: true },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json({ success: true, data: campaigns });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user || !user.workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 🛡️ Security Guard: Verify Addon
        const addon = await (prisma as any).workspaceAddon.findUnique({
            where: {
                workspace_id_addon_id: {
                    workspace_id: user.workspaceId,
                    addon_id: "BULK_EMAIL_CHANNEL" // We should optimally resolve the ID first or use name
                }
            }
        });

        // For now, if we don't have the exact ID, we can check by name via join
        const activeAddon = await (prisma as any).workspaceAddon.findFirst({
            where: {
                workspace_id: user.workspaceId,
                addon: { name: "BULK_EMAIL_CHANNEL" },
                status: "ACTIVE"
            }
        });

        if (!activeAddon) {
            return NextResponse.json({ error: "Bulk Email Addon required. Visit Marketplace to Enable." }, { status: 403 });
        }

        const { name, subject, html_content, filters, attachments, scheduledAt } = await req.json();

        // 1. Create Campaign
        const campaign = await (prisma as any).emailCampaign.create({
            data: {
                workspace_id: user.workspaceId,
                name,
                subject,
                html_content,
                filters: filters || {},
                attachments: attachments || [],
                scheduled_at: scheduledAt ? new Date(scheduledAt) : null,
                status: scheduledAt ? CampaignStatus.SCHEDULED : CampaignStatus.DRAFT
            }
        });

        // 2. Initialize Stats
        await (prisma as any).emailCampaignStats.create({
            data: { campaign_id: campaign.id }
        });

        // 3. Trigger Processor if not scheduled
        if (!scheduledAt) {
            // Processing happens in the background
            BulkEmailEngine.processCampaign(campaign.id).catch(e => {
                console.error("🚨 [ENGINE-FAILURE]:", e);
            });
        }

        return NextResponse.json({ success: true, data: campaign });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
