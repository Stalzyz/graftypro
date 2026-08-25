import { prisma } from '../lib/db';

async function diagnoseGrekam() {
    const wsId = '89b6c788-d842-4bf6-8af9-bc02e84e76d2';
    
    const workspace = await prisma.workspace.findUnique({
        where: { id: wsId }
    });

    if (!workspace) {
        console.log(`❌ Workspace ${wsId} not found`);
        return;
    }

    console.log(`\n========================================`);
    console.log(`💼 WORKSPACE: ${workspace.name} (${workspace.id})`);
    console.log(`========================================`);
    console.log(`Settings keys:`, Object.keys(workspace.settings || {}));
    console.log(`Instagram Settings:`, JSON.stringify((workspace.settings as any)?.integrations?.INSTAGRAM, null, 2));

    // Integrations Table
    const integrations = await (prisma as any).integration.findMany({
        where: { workspace_id: wsId }
    });
    console.log(`\n🔌 Integrations Table (${integrations.length} total):`);
    integrations.forEach((int: any) => {
        console.log(`  - ID: ${int.id}, Type: ${int.type}, Active: ${int.is_active}`);
        console.log(`    Credentials:`, JSON.stringify(int.credentials, null, 2));
    });

    // Flows
    const flows = await prisma.flow.findMany({
        where: { workspace_id: wsId }
    });
    console.log(`\n🌊 Flows (${flows.length} total):`);
    flows.forEach((flow: any) => {
        console.log(`  - ID: ${flow.id}, Name: ${flow.name}, Status: ${flow.status}, trigger_keyword: "${flow.trigger_keyword}"`);
    });

    // AutoResponders
    const responders = await (prisma as any).autoResponder.findMany({
        where: { workspace_id: wsId }
    });
    console.log(`\n🎯 AutoResponders (${responders.length} total):`);
    responders.forEach((ar: any) => {
        console.log(`  - keyword: "${ar.keyword}", Type: ${ar.reply_type}, Status: ${ar.status}`);
    });
}

diagnoseGrekam()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
