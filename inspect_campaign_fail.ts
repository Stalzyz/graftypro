import { prisma } from "./lib/db.ts";

async function main() {
    console.log("Searching for workspace with prefix 3b04fc39...");
    const workspace = await prisma.workspace.findFirst({
        where: {
            id: { startsWith: "3b04fc39" }
        }
    });

    if (!workspace) {
        console.log("No workspace found matching prefix 3b04fc39. Searching for all workspaces...");
        const allWs = await prisma.workspace.findMany({ select: { id: true, name: true, created_at: true } });
        console.log(JSON.stringify(allWs, null, 2));
        return;
    }

    console.log(`Found Workspace: ${workspace.id} (${workspace.name})`);

    // Find campaign
    const campaigns = await prisma.campaign.findMany({
        where: {
            workspace_id: workspace.id,
        },
        orderBy: { created_at: "desc" },
        take: 5
    });

    console.log(`Found ${campaigns.length} recent campaigns for workspace:`);
    console.log(JSON.stringify(campaigns, null, 2));

    // Find campaign stats
    for (const c of campaigns) {
        const stats = await prisma.campaignStats.findUnique({
            where: { campaign_id: c.id }
        });
        console.log(`Campaign Stats for ${c.id} (${c.name}):`, stats);
    }

    // Inspect failed messages for this workspace / campaigns
    const failedMessages = await prisma.message.findMany({
        where: {
            workspace_id: workspace.id,
            status: "FAILED"
        },
        orderBy: { created_at: "desc" },
        take: 10,
        select: {
            id: true,
            meta_id: true,
            status: true,
            error_code: true,
            error_message: true,
            created_at: true,
            failed_at: true,
            content: true,
            type: true,
            campaign_id: true
        }
    });

    console.log(`Failed messages count/sample (${failedMessages.length}):`);
    console.log(JSON.stringify(failedMessages, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
