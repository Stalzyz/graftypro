import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const ws = await prisma.workspace.findMany({
        orderBy: { created_at: 'desc' },
        take: 3,
        select: { id: true, name: true, plan: true, current_plan_id: true, trial_ends_at: true, created_at: true }
    });
    console.log(JSON.stringify(ws, null, 2));
    
    // Simulate hasPaidPlan logic
    for (const workspace of ws) {
        const isFreePlanId = workspace.current_plan_id && workspace.plan === 'FREE';
        const hasPaidPlan = (!!workspace.current_plan_id && !isFreePlanId) || (workspace.plan && workspace.plan !== 'FREE');
        console.log(`Workspace: ${workspace.name}, Plan: ${workspace.plan}, current_plan_id: ${workspace.current_plan_id}`);
        console.log(`isFreePlanId: ${isFreePlanId}, hasPaidPlan: ${hasPaidPlan}`);
    }
}
main().finally(() => prisma.$disconnect());
