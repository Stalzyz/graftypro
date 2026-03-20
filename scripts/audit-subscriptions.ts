
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function audit() {
    console.log("🔍 [SUBSCRIPTION AUDIT] Starting deep-dive diagnostics...");

    const workspaces = await prisma.workspace.findMany({
        where: {
            OR: [
                { plan: { not: 'FREE' } },
                { current_plan_id: { not: null } }
            ]
        },
        include: {
            plan_details: true
        }
    });

    console.log(`📊 Found ${workspaces.length} workspaces with non-free plans or linked subscriptions.`);

    let issuesFound = 0;
    let healed = 0;

    for (const ws of workspaces) {
        console.log(`\n🏢 Workspace: ${ws.name} (${ws.id})`);
        console.log(`   - Current Plan String: ${ws.plan}`);
        console.log(`   - Current Plan ID: ${ws.current_plan_id || 'NULL'}`);
        console.log(`   - Sub Status: ${ws.subscription_status || 'NULL'}`);

        // Issue 1: Plan ID Mismatch (Lockout Cause)
        if (ws.plan !== 'FREE' && !ws.current_plan_id) {
            console.log(`   ⚠️ [ISSUE] Paid plan string "${ws.plan}" found but current_plan_id is NULL. This user is LOCKED OUT.`);
            issuesFound++;

            // Attempt healing
            const actualPlan = await prisma.subscriptionPlan.findFirst({
                where: { name: { equals: ws.plan as string, mode: 'insensitive' } }
            });

            if (actualPlan) {
                console.log(`   ✅ Found matching plan in DB: ${actualPlan.id}. Healing...`);
                await prisma.workspace.update({
                    where: { id: ws.id },
                    data: { current_plan_id: actualPlan.id, subscription_status: 'active' }
                });
                healed++;
            } else {
                console.log(`   ❌ Failed to find a matching plan definition for "${ws.plan}" in SubscriptionPlan table.`);
            }
        }

        // Issue 2: Sync Check
        if (ws.plan_details) {
            const details = ws.plan_details as any;
            if (!details.razorpay_monthly_plan_id && !details.razorpay_yearly_plan_id) {
                console.log(`   ⚠️ [ISSUE] Plan "${details.name}" exists but is NOT synced to Razorpay. Upgrades will fail.`);
                issuesFound++;
            }
        }
    }

    console.log(`\n🏁 Audit Complete.`);
    console.log(`- Issues Identified: ${issuesFound}`);
    console.log(`- Auto-Healed: ${healed}`);
}

audit().catch(console.error).finally(() => prisma.$disconnect());
