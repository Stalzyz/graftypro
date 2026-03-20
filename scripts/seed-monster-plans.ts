
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Seeding Monster Premium Plans...");

    const plans = [
        {
            name: "LITE",
            description: "Essential WhatsApp toolkit for micro-businesses",
            monthly_price: 999.00,
            original_monthly_price: 1999.00,
            yearly_price: 9990.00,
            original_yearly_price: 19990.00,
            credits: 100,
            max_contacts: 1000,
            max_flows: 5,
            max_campaigns: 5,
            max_messages: 2500,
            max_users: 2,
            crm_access: true,
            flow_builder_access: true,
            drip_campaign_access: false,
            api_access: false,
            commerce_access: false,
            edu_engine_access: false,
            is_featured: false,
            is_public: true,
            is_active: true,
            min_reseller_monthly_price: 799.00,
            min_reseller_yearly_price: 7990.00,
            features_list: [
                "Official WhatsApp API",
                "2 Agent Shared Inbox",
                "Basic CRM Access",
                "5 Automation Flows",
                "Standard Delivery Engine"
            ],
            bonus_text: "Mobile app access",
            ai_fallback_enabled: false,
            abandoned_cart_recovery_enabled: false
        },
        {
            name: "GROWTH",
            description: "Advanced automation for Tier 2 growing brands",
            monthly_price: 2499.00,
            original_monthly_price: 3999.00,
            yearly_price: 24990.00,
            original_yearly_price: 39990.00,
            credits: 300,
            max_contacts: 10000,
            max_flows: 50,
            max_campaigns: 25,
            max_messages: 25000,
            max_users: 5,
            crm_access: true,
            flow_builder_access: true,
            drip_campaign_access: true,
            api_access: false,
            commerce_access: true,
            edu_engine_access: false,
            is_featured: true,
            is_public: true,
            min_reseller_monthly_price: 1999.00,
            min_reseller_yearly_price: 19990.00,
            features_list: [
                "Everything in Lite+",
                "50 Automation Flows",
                "Drip Campaigns & Sequences",
                "5 Agent Shared Inbox",
                "Commerce Store Integration",
                "AI Fallback Assistant"
            ],
            bonus_text: "Everything in Lite, Mobile access",
            ai_fallback_enabled: true,
            abandoned_cart_recovery_enabled: false
        },
        {
            name: "PRO",
            description: "Full API power for automation powerhouses",
            monthly_price: 4999.00,
            original_monthly_price: 7999.00,
            yearly_price: 49990.00,
            original_yearly_price: 79990.00,
            credits: 750,
            max_contacts: 50000,
            max_flows: -1,
            max_campaigns: 100,
            max_messages: 100000,
            max_users: 15,
            crm_access: true,
            flow_builder_access: true,
            drip_campaign_access: true,
            api_access: true,
            commerce_access: true,
            edu_engine_access: true,
            is_featured: false,
            is_public: true,
            min_reseller_monthly_price: 3999.00,
            min_reseller_yearly_price: 39990.00,
            features_list: [
                "Everything in Growth+",
                "Full API & Webhook Access",
                "Unlimited Flows",
                "Abandoned Cart Recovery",
                "Edu-Engine Profiling",
                "Priority Email Support"
            ],
            bonus_text: "Everything in Growth, Mobile access",
            ai_fallback_enabled: true,
            abandoned_cart_recovery_enabled: true
        },
        {
            name: "SCALE",
            description: "Enterprise scale with priority delivery engine",
            monthly_price: 9999.00,
            original_monthly_price: 19999.00,
            yearly_price: 99990.00,
            original_yearly_price: 199990.00,
            credits: 2000,
            max_contacts: 200000,
            max_flows: -1,
            max_campaigns: -1,
            max_messages: 500000,
            max_users: 100,
            crm_access: true,
            flow_builder_access: true,
            drip_campaign_access: true,
            api_access: true,
            commerce_access: true,
            edu_engine_access: true,
            is_featured: false,
            is_public: true,
            min_reseller_monthly_price: 7999.00,
            min_reseller_yearly_price: 79990.00,
            features_list: [
                "Everything in Pro+",
                "Priority Delivery Engine",
                "Enterprise AI Assistant",
                "Dedicated Account Manager",
                "Custom SLA & Tech Support",
                "White-label Reports"
            ],
            bonus_text: "Everything in Pro, Mobile access",
            ai_fallback_enabled: true,
            abandoned_cart_recovery_enabled: true
        }
    ];

    // Clear old plans
    await prisma.subscriptionPlan.deleteMany({});

    for (const plan of plans) {
        await prisma.subscriptionPlan.create({
            data: plan as any
        });
    }

    console.log("✅ Monster Plans Seeded Successfully!");
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
