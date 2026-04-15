import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const workspaces = await prisma.workspace.findMany({
    orderBy: { created_at: 'desc' },
    take: 3,
    select: {
      id: true,
      name: true,
      created_at: true,
      trial_ends_at: true,
      current_plan_id: true,
      plan: true
    }
  });
  console.log("Recent Workspaces:", JSON.stringify(workspaces, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
