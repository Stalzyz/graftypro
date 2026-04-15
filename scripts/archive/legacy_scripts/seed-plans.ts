import { PrismaClient } from "../lib/generated/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Seeding Subscription Plans...");

    const plans = [
        {
            name: "FREE",
            description: "Starter kit for small businesses",
            price: 0,
            max_contacts: 100,
            max_flows: 3,
            max_campaigns: 1,
            max_messages: 500,
            max_users: 1,
            max_teams: 0,
            flow_builder_access: true,
            crm_access: true
        },
        {
            name: "PRO",
            description: "Scale your customer outreach",
            price: 2499,
            max_contacts: 5000,
            max_flows: 20,
            max_campaigns: 10,
            max_messages: 10000,
            max_users: 5,
            max_teams: 1,
            flow_builder_access: true,
            crm_access: true,
            api_access: true,
            drip_campaign_access: true
        },
        {
            name: "ENTERPRISE",
            description: "High-volume automation for large teams",
            price: 9999,
            max_contacts: 50000,
            max_flows: -1, // Unlimited
            max_campaigns: -1,
            max_messages: 100000,
            max_users: 25,
            max_teams: 5,
            flow_builder_access: true,
            crm_access: true,
            api_access: true,
            drip_campaign_access: true,
            commerce_access: true,
            edu_engine_access: true
        }
    ];

    for (const plan of plans) {
        await prisma.subscriptionPlan.upsert({
            where: { name: plan.name },
            update: plan,
            create: plan
        });
    }

    console.log("✅ Plans Seeded Successfully!");
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
