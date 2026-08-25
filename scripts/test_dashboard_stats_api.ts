import { prisma } from '../lib/db';

async function testStats() {
    const user = await prisma.user.findFirst({
        where: { email: 'sivanesanm153@gmail.com' }
    });

    if (!user) {
        console.error('User sivanesanm153@gmail.com not found!');
        return;
    }

    const workspaceId = user.workspace_id;
    console.log(`Testing stats for Workspace: ${workspaceId}`);

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
            select: { trial_ends_at: true, plan: true, current_plan_id: true, subscription_status: true }
        }),
        prisma.user.findUnique({
            where: { id: user.id },
            select: { email: true }
        })
    ]);

    console.log('--- Stats Results ---');
    console.log({
        contactsCount,
        messagesSent,
        activeFlows,
        recentCampaignsCount: recentCampaigns.length,
        totalRevenue,
        funnelStats,
        wabaExists: !!waba,
        vendorWalletExists: !!vendorWallet,
        workspaceExists: !!workspace,
        dbUserExists: !!dbUser
    });
}

testStats()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
