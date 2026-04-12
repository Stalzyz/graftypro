
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Seeding Official 3-Plan Grafty Pricing...");

    const plans = [
        {
            name: "STARTER",
            description: "Essential WhatsApp Automation for small teams.",
            monthly_price: 999.00,
            original_monthly_price: 2999.00,
            yearly_price: 9990.00,
            original_yearly_price: 29990.00,
            credits: 100,
            currency: "INR",
            max_contacts: 1000,
            max_flows: 10,
            max_campaigns: 10,
            max_messages: 5000,
            max_users: 2,
            max_teams: 0,
            crm_access: false,
            flow_builder_access: true,
            drip_campaign_access: false,
            api_access: false,
            commerce_access: false,
            edu_engine_access: false,
            module_quick_replies: true,
            flow_msg_access: true,
            flow_automation_access: false,
            flow_logic_access: false,
            flow_integration_access: false,
            is_featured: false,
            is_public: true,
            is_active: true,
            badge_text: "Get Started",
            cta_label: "Get Started",
            sort_order: 1,
            min_reseller_monthly_price: 1499.00,
            min_reseller_yearly_price: 14990.00,
            features_list: [
                "Official WhatsApp API",
                "2 Agent Shared Inbox",
                "Quick Replies Automation",
                "Visual Flow Builder (Message Nodes)",
                "Unlimited Broadcasts",
                "Basic Analytics"
            ],
            bonus_text: "Mobile app access",
            ai_fallback_enabled: false,
            abandoned_cart_recovery_enabled: false
        },
        {
            name: "GROWTH",
            description: "Scale your sales with E-Commerce, CRM and full automation.",
            monthly_price: 2999.00,
            original_monthly_price: 5999.00,
            yearly_price: 29990.00,
            original_yearly_price: 59990.00,
            credits: 300,
            currency: "INR",
            max_contacts: 5000,
            max_flows: 50,
            max_campaigns: 50,
            max_messages: 25000,
            max_users: 10,
            max_teams: 2,
            crm_access: true,
            flow_builder_access: true,
            drip_campaign_access: true,
            api_access: false,
            commerce_access: true,
            edu_engine_access: true,
            module_quick_replies: true,
            module_crm: true,
            module_ecommerce: true,
            module_academy: true,
            module_drip: true,
            flow_msg_access: true,
            flow_automation_access: true,
            flow_logic_access: true,
            flow_commerce_access: true,
            flow_integration_access: false,
            is_featured: true,
            is_public: true,
            is_active: true,
            badge_text: "Best Value",
            cta_label: "Start Free Trial",
            sort_order: 2,
            min_reseller_monthly_price: 2999.00,
            min_reseller_yearly_price: 29990.00,
            features_list: [
                "Everything in Starter",
                "CRM & Lead Management",
                "E-Commerce WhatsApp Shop",
                "Courses & Academy Engine",
                "Drip Sequences & Logic Nodes",
                "10 Agent Shared Inbox"
            ],
            bonus_text: "Everything in Starter, Mobile access",
            ai_fallback_enabled: true,
            abandoned_cart_recovery_enabled: false
        },
        {
            name: "ENTERPRISE",
            description: "Ultimate scale with Integrations, full API and a dedicated success manager.",
            monthly_price: 14999.00,
            original_monthly_price: 24999.00,
            yearly_price: 149990.00,
            original_yearly_price: 249990.00,
            credits: 2000,
            currency: "INR",
            max_contacts: 50000,
            max_flows: 500,
            max_campaigns: 500,
            max_messages: 250000,
            max_users: 50,
            max_teams: 10,
            crm_access: true,
            flow_builder_access: true,
            drip_campaign_access: true,
            api_access: true,
            commerce_access: true,
            edu_engine_access: true,
            module_quick_replies: true,
            module_crm: true,
            module_ecommerce: true,
            module_academy: true,
            module_drip: true,
            module_integration: true,
            flow_msg_access: true,
            flow_automation_access: true,
            flow_logic_access: true,
            flow_commerce_access: true,
            flow_integration_access: true,
            is_featured: false,
            is_public: true,
            is_active: true,
            badge_text: "Enterprise",
            cta_label: "Upgrade Now",
            sort_order: 3,
            min_reseller_monthly_price: 11999.00,
            min_reseller_yearly_price: 119990.00,
            features_list: [
                "Everything in Growth",
                "Full REST API & Webhook Access",
                "Integration Nodes (Shopify/WooCommerce)",
                "50 Agent Shared Inbox",
                "Dedicated Success Manager",
                "Custom SLA & Priority Support"
            ],
            bonus_text: "Everything in Growth, Mobile access, Priority support",
            ai_fallback_enabled: true,
            abandoned_cart_recovery_enabled: true
        }
    ];

    // Bug #10 Fix: NEVER delete and re-create plans — that orphans every vendor's
    // current_plan_id foreign key. Use upsert keyed on name so IDs stay stable
    // across every re-deploy. Only fields that need updating are touched.
    console.log("🔄 Upserting plans (IDs preserved for existing vendors)...");

    for (const plan of plans) {
        console.log(`⏳ Upserting plan: ${plan.name} @ ₹${plan.monthly_price}/mo...`);
        const existing = await prisma.subscriptionPlan.findFirst({
            where: { name: plan.name, reseller_id: null }
        });

        if (existing) {
            await prisma.subscriptionPlan.update({
                where: { id: existing.id },
                data: plan as any
            });
            console.log(`✅ ${plan.name} updated (ID preserved: ${existing.id})`);
        } else {
            await prisma.subscriptionPlan.create({ data: plan as any });
            console.log(`✅ ${plan.name} created.`);
        }
    }

    console.log("\n✨ Official 3-Plan Pricing Seeded Successfully!");
    console.log("   → STARTER:     ₹999/mo");
    console.log("   → GROWTH:     ₹2,999/mo  [Best Value ⭐]");
    console.log("   → ENTERPRISE: ₹14,999/mo");
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
