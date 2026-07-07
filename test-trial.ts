import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const locks = await prisma.trialLock.findMany({
        orderBy: { first_used_at: 'desc' },
        take: 3
    });
    console.log("Recent Trial Locks:", locks);
    const w = await prisma.workspace.findMany({
        orderBy: { created_at: 'desc' },
        take: 3,
        select: { id: true, name: true, plan: true, current_plan_id: true, trial_ends_at: true, created_at: true }
    });
    console.log("Recent Workspaces:", w);
}
main().finally(() => prisma.$disconnect());
