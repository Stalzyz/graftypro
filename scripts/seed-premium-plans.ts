
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Seeding Premium Subscription Plans...");

    const plans = [
        {
            name: "LITE CHAT",
            description: "Essential live chat & campaign toolkit",
            price: 999.00,
            monthly_price: 999.00,
            yearly_price: 9990.00,
            credits: 500,
            max_contacts: 500,
            max_flows: 0,
            max_campaigns: 2,
            max_messages: 1000,
            max_users: 1,
            crm_access: true,
            flow_builder_access: false,
            drip_campaign_access: false,
            api_access: false,
            commerce_access: false,
            edu_engine_access: false,
            is_featured: false,
            is_public: true,
            min_reseller_price: 499.00,
            features_list: [
                "Live Chat Inbox (1 Agent)",
                "Templates & Campaigns",
                "No Automations or Flows",
                "1,000 Monthly Messages"
            ]
        },
        {
            name: "PRIME STARTER",
            description: "Essential WhatsApp toolkit for small businesses",
            price: 1999.00,
            monthly_price: 1999.00,
            yearly_price: 19990.00,
            credits: 1000,
            max_contacts: 1000,
            max_flows: 10,
            max_campaigns: 5,
            max_messages: 2500,
            max_users: 2,
            crm_access: true,
            flow_builder_access: true,
            is_featured: false,
            is_public: true,
            min_reseller_price: 999.00,
            features_list: [
                "Universal CRM (Table View)",
                "Standard Flow Builder (10 Flows)",
                "Bulk Broadcast (5 per month)",
                "2,500 Monthly Messages",
                "Shared Inbox (2 Agents)",
                "Google Sheets Sync"
            ]
        },
        {
            name: "ACCELERATOR PRO",
            description: "Scaled automation for growing teams",
            price: 4999.00,
            monthly_price: 4999.00,
            yearly_price: 49990.00,
            credits: 10000,
            max_contacts: 10000,
            max_flows: 50,
            max_campaigns: 25,
            max_messages: 25000,
            max_users: 10,
            crm_access: true,
            flow_builder_access: true,
            drip_campaign_access: true,
            api_access: true,
            is_featured: true,
            is_public: true,
            min_reseller_price: 2499.00,
            features_list: [
                "Advanced CRM (Kanban Board)",
                "Drip Sequences (Automated Follow-ups)",
                "50 Advanced Flows",
                "25,000 Monthly Messages",
                "Shared Inbox (10 Agents)",
                "Meta Lead Ads Integration",
                "Full API Access"
            ]
        },
        {
            name: "ULTIMATE SCALE",
            description: "Full-power enterprise messaging suite",
            price: 12999.00,
            monthly_price: 12999.00,
            yearly_price: 129990.00,
            credits: 100000,
            max_contacts: 100000,
            max_flows: -1,
            max_campaigns: -1,
            max_messages: 1000000,
            max_users: 25,
            crm_access: true,
            flow_builder_access: true,
            drip_campaign_access: true,
            api_access: true,
            commerce_access: true,
            edu_engine_access: true,
            is_featured: false,
            is_public: true,
            min_reseller_price: 6999.00,
            features_list: [
                "Ultimate E-commerce Engine",
                "AI Lead Profiling (Edu-Engine)",
                "Unlimited Automation Flows",
                "1 Million Monthly Messages",
                "In-Chat Checkout (Razorpay/Shopify)",
                "White-label Reports",
                "Dedicated Success Manager"
            ]
        }
    ];

    // Clear old generic plans
    await prisma.subscriptionPlan.deleteMany({
        where: {
            name: { in: ["FREE", "PRO", "ENTERPRISE", "Free Plan", "Pro Plan", "Basic"] }
        }
    });

    for (const plan of plans) {
        await prisma.subscriptionPlan.upsert({
            where: { name: plan.name },
            update: plan as any,
            create: plan as any
        });
    }

    console.log("✅ Premium Plans Seeded Successfully!");
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
