const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const workspaceId = '3b04fc39-771d-4add-b3aa-bd4373dc84f7';
    
    // Get Pummy's flow
    const flows = await prisma.flow.findMany({
        where: { workspace_id: workspaceId },
        select: { id: true, name: true, nodes: true, edges: true }
    });

    for (const flow of flows) {
        const nodes = flow.nodes as any[];
        const paymentNodes = nodes.filter((n: any) => n.type === 'payment' || n.type === 'Payment');
        const collectInputNodes = nodes.filter((n: any) => n.type === 'collect_input');
        const actionNodes = nodes.filter((n: any) => n.type === 'action');

        console.log(`\n=== FLOW: ${flow.name} (${flow.id}) ===`);
        console.log(`Total nodes: ${nodes.length}`);
        
        console.log('\n--- PAYMENT NODES ---');
        paymentNodes.forEach((n: any) => {
            console.log(JSON.stringify({ id: n.id, data: n.data }, null, 2));
        });

        console.log('\n--- COLLECT_INPUT NODES ---');
        collectInputNodes.forEach((n: any) => {
            console.log(JSON.stringify({ id: n.id, data: n.data }, null, 2));
        });

        console.log('\n--- SET_VARIABLE ACTION NODES ---');
        actionNodes
            .filter((n: any) => n.data?.actionType === 'set_variable')
            .slice(0, 5)
            .forEach((n: any) => {
                console.log(JSON.stringify({ id: n.id, data: n.data }, null, 2));
            });
    }

    // Also check active sessions for pummy workspace
    const sessions = await prisma.flowSession.findMany({
        where: { workspace_id: workspaceId, is_completed: false },
        select: { id: true, current_node_id: true, state: true, updated_at: true },
        orderBy: { updated_at: 'desc' },
        take: 5
    });

    console.log('\n\n=== ACTIVE SESSIONS ===');
    sessions.forEach((s: any) => {
        console.log(JSON.stringify({ id: s.id, current_node_id: s.current_node_id, state: s.state, updated_at: s.updated_at }, null, 2));
    });

    await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
