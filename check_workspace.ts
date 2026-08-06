import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const workspaces = await prisma.workspace.findMany({
    where: {
      id: {
        startsWith: '3b04fc39-771'
      }
    },
    select: {
      id: true,
      name: true,
      plan: true,
      subscription_status: true,
      trial_ends_at: true,
      users: {
        select: {
          email: true
        }
      }
    }
  });
  console.log(JSON.stringify(workspaces, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
