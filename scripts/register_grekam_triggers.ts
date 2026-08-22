import { prisma } from '../lib/db';

async function main() {
  const EXACT_WORKSPACE_ID = '89b6c788-d842-4bf6-8af9-bc02e84e76d2';

  let workspace = await prisma.workspace.findUnique({
    where: { id: EXACT_WORKSPACE_ID }
  });

  if (!workspace) {
    workspace = await prisma.workspace.findFirst({
      where: { id: { startsWith: '89b6c788' } }
    });
  }

  const workspaceId = workspace ? workspace.id : EXACT_WORKSPACE_ID;
  const flowId = 'grekam-ecommerce-flow-01';

  // 1. Create AutoResponder for "Ecommerce"
  await (prisma as any).autoResponder.upsert({
    where: {
      id: 'ar-grekam-ecommerce-trigger'
    },
    update: {
      workspace_id: workspaceId,
      keyword: 'Ecommerce',
      match_type: 'EXACT',
      reply_type: 'FLOW',
      flow_id: flowId,
      status: true
    },
    create: {
      id: 'ar-grekam-ecommerce-trigger',
      workspace_id: workspaceId,
      keyword: 'Ecommerce',
      match_type: 'EXACT',
      reply_type: 'FLOW',
      flow_id: flowId,
      status: true
    }
  });

  // 2. Create AutoResponder for "Get Quote"
  await (prisma as any).autoResponder.upsert({
    where: {
      id: 'ar-grekam-quote-trigger'
    },
    update: {
      workspace_id: workspaceId,
      keyword: 'Get Quote',
      match_type: 'EXACT',
      reply_type: 'FLOW',
      flow_id: flowId,
      status: true
    },
    create: {
      id: 'ar-grekam-quote-trigger',
      workspace_id: workspaceId,
      keyword: 'Get Quote',
      match_type: 'EXACT',
      reply_type: 'FLOW',
      flow_id: flowId,
      status: true
    }
  });

  console.log(`✅ AutoResponder keyword triggers registered for Workspace ID ${workspaceId}: "Ecommerce" & "Get Quote"`);
  await prisma.$disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
