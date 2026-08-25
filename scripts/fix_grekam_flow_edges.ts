import { prisma } from '../lib/db';

async function main() {
  const EXACT_WORKSPACE_ID = '89b6c788-d842-4bf6-8af9-bc02e84e76d2';
  const flowId = 'grekam-ecommerce-flow-01';

  console.log(`🔧 Cleaning orphan nodes for flow ${flowId} in workspace ${EXACT_WORKSPACE_ID}...`);

  const flow = await (prisma as any).flow.findUnique({
    where: { id: flowId }
  });

  if (!flow) {
    console.error('Flow not found!');
    return;
  }

  const nodes = (flow.nodes as any[]) || [];
  const edges = (flow.edges as any[]) || [];

  // Filter out unconnected 'end' nodes (e.g. node_end if node_3 is connected)
  const connectedTargets = new Set(edges.map(e => e.target));
  const cleanedNodes = nodes.filter(n => {
    if (n.type === 'end' && !connectedTargets.has(n.id) && nodes.some(other => other.type === 'end' && connectedTargets.has(other.id))) {
      console.log(`Pruning orphaned end node: ${n.id} (${n.data?.label || 'End'})`);
      return false;
    }
    return true;
  });

  await (prisma as any).flow.update({
    where: { id: flowId },
    data: {
      nodes: cleanedNodes,
      edges: edges,
      status: 'PUBLISHED'
    }
  });

  console.log(`✅ Flow ${flowId} cleaned and published successfully!`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
