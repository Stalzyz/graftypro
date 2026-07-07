import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const workspaceId = user.workspaceId;

        const [
            contactsCount,
            messagesSent,
            activeFlows,
            recentCampaigns,
            totalRevenue,
            funnelStats,
            waba,
            vendorWallet,
            workspace,
            dbUser
        ] = await Promise.all([
            prisma.contact.count({
                where: { workspace_id: workspaceId }
            }),
            prisma.message.count({
                where: {
                    workspace_id: workspaceId,
                    direction: "OUTBOUND"
                }
            }),
            prisma.flow.count({
                where: {
                    workspace_id: workspaceId,
                    status: "PUBLISHED"
                }
            }),
            prisma.campaign.findMany({
                where: { workspace_id: workspaceId },
                orderBy: { created_at: "desc" },
                take: 5,
                include: { stats: true }
            }),
            prisma.order.aggregate({
                where: {
                    workspace_id: workspaceId,
                    status: "PAID"
                },
                _sum: { total_amount: true }
            }),
            prisma.campaignStats.aggregate({
                where: {
                    campaign: { workspace_id: workspaceId }
                },
                _sum: {
                    sent: true,
                    delivered: true,
                    read: true,
                    replied: true
                }
            }),
            prisma.whatsAppAccount.findUnique({
                where: { workspace_id: workspaceId }
            }),
            prisma.vendorWallet.findUnique({
                where: { workspace_id: workspaceId }
            }),
            prisma.workspace.findUnique({
                where: { id: workspaceId },
                select: { trial_ends_at: true, plan: true, current_plan_id: true }
            }),
            prisma.user.findUnique({
                where: { id: user.userId },
                select: { email: true }
            })
        ]);

        let trialDaysLeft = null;
        if (workspace) {
            const isFreePlanId = workspace.current_plan_id && workspace.plan === 'FREE';
            const hasPaidPlan = (!!workspace.current_plan_id && !isFreePlanId) || (workspace.plan && workspace.plan !== 'FREE');
            
            if (!hasPaidPlan && dbUser?.email) {
                let trialEnd = workspace.trial_ends_at;
                const lock = await prisma.trialLock.findUnique({ where: { email: dbUser.email } });
                if (lock) trialEnd = lock.trial_ends_at;
                
                if (trialEnd) {
                    const days = Math.ceil((trialEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                    trialDaysLeft = Math.max(0, days);
                }
            }
        }

        const isWabaConnected = !!waba && waba.status === "CONNECTED";
        const revenueRecovered = totalRevenue._sum.total_amount || 0;
        const potentialRevenue = contactsCount * 450; // Simple estimation logic ₹450 per contact potential

        return NextResponse.json({
            contactsCount,
            messagesSent,
            activeFlows,
            trialDaysLeft,
            wabaConnected: isWabaConnected,
            wabaDetails: waba ? {
                status: waba.status,
                phone_number: waba.phone_number
            } : null,
            walletBalance: vendorWallet?.current_balance || 0,
            revenueRecovered,
            potentialRevenue,
            totalRevenue: totalRevenue._sum.total_amount || 0,
            funnel: {
                sent: funnelStats._sum.sent || 0,
                delivered: funnelStats._sum.delivered || 0,
                read: funnelStats._sum.read || 0,
                replied: funnelStats._sum.replied || 0
            },
            recentCampaigns: recentCampaigns.map(c => ({
                id: c.id,
                name: c.name,
                status: c.status,
                created_at: c.created_at,
                sent_count: c.stats?.sent || 0
            }))
        });

    } catch (error) {
        console.error("Dashboard Stats Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
