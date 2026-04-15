
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2] || "admin@grafty.com"; // Default to your admin email
    const planName = process.argv[3] || "GROWTH"; // Default to Growth for testing locks

    console.log(`🔍 Finding user: ${email}...`);
    const user = await prisma.user.findFirst({
        where: { email },
        select: { workspace_id: true }
    });

    if (!user) {
        console.error("❌ User not found!");
        return;
    }

    console.log(`🔍 Finding plan: ${planName}...`);
    const plan = await prisma.subscriptionPlan.findUnique({
        where: { name: planName }
    });

    if (!plan) {
        console.error(`❌ Plan ${planName} not found in database!`);
        return;
    }

    console.log(`⚙️ Switching workspace ${user.workspace_id} to ${planName} plan...`);
    await prisma.workspace.update({
        where: { id: user.workspace_id },
        data: {
            current_plan_id: plan.id,
            plan: planName as any,
            subscription_status: "ACTIVE"
        }
    });

    console.log(`✅ SUCCESS! Your account is now on the ${planName} plan.`);
    console.log(`👉 Refresh your dashboard at https://grafty.pro/dashboard to see the locks.`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
