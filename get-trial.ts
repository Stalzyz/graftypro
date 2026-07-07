import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const workspaces = await prisma.workspace.findMany({
        orderBy: { created_at: 'desc' },
        take: 1,
        select: { id: true, name: true, plan: true, current_plan_id: true, trial_ends_at: true, created_at: true, users: { select: { email: true } } }
    });
    console.log("Most recent workspace:", JSON.stringify(workspaces, null, 2));
    
    if (workspaces.length > 0 && workspaces[0].users.length > 0) {
        const userEmail = workspaces[0].users[0].email;
        const lock = await prisma.trialLock.findUnique({ where: { email: userEmail } });
        console.log("Trial Lock:", lock);
    }
}
main().finally(() => prisma.$disconnect());
