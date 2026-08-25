import { prisma } from "../lib/db";
import { SubscriptionNotificationService } from "../lib/services/subscription-notification";

async function main() {
    console.log("🔍 Checking all workspaces for subscription expiration (within last 7 days)...");
    const workspaces = await prisma.workspace.findMany({
        select: {
            id: true,
            name: true,
            trial_ends_at: true,
            subscription_ends_at: true,
            subscription_status: true,
            plan: true,
            created_at: true,
            plan_details: { select: { name: true } }
        }
    });

    console.log(`Found ${workspaces.length} total workspaces in database.`);

    for (const ws of workspaces) {
        const info = SubscriptionNotificationService.getSubscriptionInfo(ws);
        console.log(`\n🏢 Workspace: ${ws.name} (${ws.id})`);
        console.log(`   - Status: ${info.status}`);
        console.log(`   - Plan: ${info.plan_name}`);
        console.log(`   - Expiration Date: ${info.subscription_ends_at}`);
        console.log(`   - Days Left: ${info.days_left}`);
        console.log(`   - Expiring Soon (<= 7 days): ${info.is_expiring_soon}`);
        console.log(`   - Expired: ${info.is_expired}`);

        if (info.is_expiring_soon || info.is_expired) {
            console.log(`📧 Triggering email notification test for ${ws.name}...`);
            const res = await SubscriptionNotificationService.checkAndSendExpiryEmail(ws.id);
            console.log(`   Result: ${JSON.stringify(res)}`);
        }
    }
}

main().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
}).finally(() => {
    prisma.$disconnect();
});
