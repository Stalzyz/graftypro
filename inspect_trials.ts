import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: "postgresql://user:password@localhost:5435/wabot_bsp?schema=public"
        }
    }
});

async function main() {
  const workspaces = await prisma.workspace.findMany({
    take: 5,
    orderBy: { created_at: 'desc' },
    select: { id: true, plan: true, current_plan_id: true, subscription_status: true, trial_ends_at: true, created_at: true }
  });
  console.log(workspaces);
}
main().catch(console.error).finally(() => prisma.$disconnect());
