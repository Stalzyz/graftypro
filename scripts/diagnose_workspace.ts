import { prisma } from '../lib/db';

async function diagnoseWorkspace() {
    const workspaceId = '3b04fc39';
    
    // Find workspace by partial ID
    const workspace = await (prisma as any).workspace.findFirst({
        where: { id: { startsWith: workspaceId } },
        select: { id: true, name: true }
    });

    if (!workspace) {
        console.log(`❌ No workspace found starting with "${workspaceId}"`);
        process.exit(1);
    }

    console.log(`\n✅ Workspace: ${workspace.name} (${workspace.id})\n`);
    const wsId = workspace.id;

    // 1. Check WABA
    const waba = await (prisma as any).whatsAppAccount.findFirst({
        where: { workspace_id: wsId },
        select: { id: true, phone_number: true, phone_number_id: true, status: true }
    });
    console.log('📱 WABA:', waba ? JSON.stringify(waba, null, 2) : '❌ NOT FOUND');

    // 2. Check AutoResponders
    const responders = await (prisma as any).autoResponder.findMany({
        where: { workspace_id: wsId },
        include: { flow: { select: { id: true, name: true, status: true } } }
    });
    console.log(`\n🎯 AutoResponders (${responders.length} total):`);
    responders.forEach((r: any) => {
        console.log(`  - keyword="${r.keyword}" match_type=${r.match_type} reply_type=${r.reply_type} status=${r.status}`);
        if (r.flow) console.log(`    → Flow: "${r.flow.name}" (${r.flow.id}) status=${r.flow.status}`);
        if (r.reply_text) console.log(`    → Text: "${r.reply_text}"`);
    });

    // 3. Check Published Flows with trigger_keyword
    const flows = await (prisma as any).flow.findMany({
        where: { workspace_id: wsId, status: 'PUBLISHED' },
        select: { id: true, name: true, status: true, trigger_keyword: true }
    });
    console.log(`\n🌊 Published Flows (${flows.length} total):`);
    flows.forEach((f: any) => {
        console.log(`  - "${f.name}" trigger_keyword="${f.trigger_keyword}" status=${f.status}`);
    });

    // 4. Check any active sessions
    const sessions = await (prisma as any).flowSession.findMany({
        where: { workspace_id: wsId, status: 'ACTIVE' },
        take: 5,
        select: { id: true, contact_id: true, flow_id: true, current_node_id: true, created_at: true }
    });
    console.log(`\n🔄 Active Sessions (${sessions.length}):`);
    sessions.forEach((s: any) => {
        console.log(`  - session=${s.id} contact=${s.contact_id} flow=${s.flow_id}`);
    });

    // 5. Check last 5 inbound messages for the workspace
    const messages = await (prisma as any).message.findMany({
        where: { workspace_id: wsId, direction: 'INBOUND' },
        orderBy: { created_at: 'desc' },
        take: 5,
        select: { id: true, type: true, content: true, created_at: true, contact_id: true }
    });
    console.log(`\n📩 Last 5 Inbound Messages:`);
    messages.forEach((m: any) => {
        const body = (m.content as any)?.body || JSON.stringify(m.content).substring(0, 80);
        console.log(`  - [${m.created_at.toISOString()}] type=${m.type} body="${body}"`);
    });

    await prisma.$disconnect();
}

diagnoseWorkspace().catch(e => {
    console.error('Error:', e.message);
    process.exit(1);
});
