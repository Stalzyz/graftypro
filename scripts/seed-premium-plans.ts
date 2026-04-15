
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Seeding Monster Packaging Strategy (3-Tier Model)...");

    const plans = [
        {
            name: "STARTER",
            description: "Perfect for getting started with Visual Messaging.",
            price: 999.00, monthly_price: 999.00, yearly_price: 9990.00,
            original_monthly_price: 2999.00,
            min_reseller_monthly_price: 499.00,
            min_reseller_yearly_price: 4990.00,
            credits: 0,
            is_managed: true,
            unlimited_messaging: false,
            is_featured: false,
            badge_text: "Basics",
            max_contacts: 5000,
            max_flows: 10,
            max_users: 2,
            
            // Package 1 Modules
            module_quick_replies: true,
            module_crm: false,
            module_ecommerce: false,
            module_academy: false,
            module_drip: false,
            
            // Package 1 Flow Nodes
            flow_msg_access: true,
            flow_automation_access: false,
            flow_logic_access: false,
            flow_commerce_access: false,
            flow_integration_access: false,

            // Legacy Mapping
            crm_access: false,
            flow_builder_access: true,
            drip_campaign_access: false,
            commerce_access: false,
            edu_engine_access: false,

            is_public: true,
            features_list: [
                "Quick Replies Access",
                "Visual Flow Builder",
                "Message Nodes Only",
                "Shared Inbox (2 Agents)",
                "Unlimited Broadcasts"
            ]
        },
        {
            name: "GROWTH",
            description: "Scale your sales with E-commerce and CRM.",
            price: 2999.00, monthly_price: 2999.00, yearly_price: 29990.00,
            original_monthly_price: 5999.00,
            min_reseller_monthly_price: 1999.00,
            min_reseller_yearly_price: 19990.00,
            credits: 0,
            is_managed: true,
            unlimited_messaging: false,
            is_featured: true,
            badge_text: "Best Value",
            max_contacts: 25000,
            max_flows: 50,
            max_users: 10,
            
            // Package 2 Modules
            module_quick_replies: true,
            module_crm: true,
            module_ecommerce: true,
            module_academy: true,
            module_drip: false,
            
            // Package 2 Flow Nodes
            flow_msg_access: true,
            flow_automation_access: true,
            flow_logic_access: true,
            flow_commerce_access: true,
            flow_integration_access: false,

            // Legacy Mapping
            crm_access: true,
            flow_builder_access: true,
            drip_campaign_access: false,
            commerce_access: true,
            edu_engine_access: true,

            is_public: true,
            features_list: [
                "Everything in Starter",
                "CRM & Lead Management",
                "E-Commerce WhatsApp Shop",
                "Courses & Academy Engine",
                "Logic & Automation Nodes",
                "Shared Inbox (10 Agents)"
            ]
        },
        {
            name: "ENTERPRISE",
            description: "Ultimate scale with Drips and Integrations.",
            price: 14999.00, monthly_price: 14999.00, yearly_price: 149990.00,
            original_monthly_price: 24999.00,
            min_reseller_monthly_price: 9999.00,
            min_reseller_yearly_price: 99990.00,
            credits: 0,
            is_managed: true,
            unlimited_messaging: false,
            is_featured: false,
            badge_text: "Enterprise",
            max_contacts: -1,
            max_flows: -1,
            max_users: 50,
            
            // Package 3 Modules
            module_quick_replies: true,
            module_crm: true,
            module_ecommerce: true,
            module_academy: true,
            module_drip: true,
            
            // Package 3 Flow Nodes
            flow_msg_access: true,
            flow_automation_access: true,
            flow_logic_access: true,
            flow_commerce_access: true,
            flow_integration_access: true,

            // Legacy Mapping
            crm_access: true,
            flow_builder_access: true,
            drip_campaign_access: true,
            commerce_access: true,
            edu_engine_access: true,

            is_public: true,
            features_list: [
                "Everything in Growth",
                "Drip Message Sequences",
                "Advanced CRM Engine",
                "Integration Nodes (Webhooks/Shopify)",
                "Dedicated Success Manager",
                "Shared Inbox (50 Agents)"
            ]
        }
    ];

    // Clear legacy plans
    const newPlanNames = plans.map(p => p.name);
    await prisma.subscriptionPlan.deleteMany({
        where: {
            name: { notIn: newPlanNames }
        }
    });

    for (const plan of plans) {
        await prisma.subscriptionPlan.upsert({
            where: { name: plan.name },
            update: plan as any,
            create: plan as any
        });
    }

    console.log("✅ Monster Packaging System Seeded Successfully (3 Core Tiers)!");
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());

