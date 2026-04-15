import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Seeding Super Admin Subscription Packages...");

    // 1. STARTER
    await prisma.subscriptionPlan.upsert({
        where: { name: "STARTER" },
        update: {},
        create: {
            name: "STARTER",
            description: "Perfect for getting started with Visual Messaging.",
            monthly_price: 999,
            original_monthly_price: 2999,
            yearly_price: 9990, // ~2 Months Free
            min_reseller_monthly_price: 499,  // Adjusted Margin Floor
            min_reseller_yearly_price: 4990,   // Adjusted Margin Floor
            currency: "INR",
            max_users: 2,
            max_contacts: 10000,
            max_flows: 10,
            module_quick_replies: true,
            flow_builder_access: true,
            flow_msg_access: true,
            accent_color: "#27954D",
            badge_text: "Standard",
            sort_order: 1,
            features_list: [
                "Quick Replies Access",
                "Visual Flow Builder",
                "Message Nodes Only",
                "Shared Inbox (2 Agents)",
                "Unlimited Broadcasts"
            ]
        }
    });

    // 2. GROWTH
    await prisma.subscriptionPlan.upsert({
        where: { name: "GROWTH" },
        update: {},
        create: {
            name: "GROWTH",
            description: "Advanced Automation & Sales Conversion.",
            monthly_price: 2999,
            original_monthly_price: 5999,
            yearly_price: 29990, // ~2 Months Free
            min_reseller_monthly_price: 1999, // 50% Margin Floor
            min_reseller_yearly_price: 19990,  // 50% Margin Floor
            currency: "INR",
            max_users: 10,
            max_contacts: 50000,
            max_flows: 50,
            is_featured: true,
            badge_text: "Best Value",
            module_crm: true,
            module_ecommerce: true,
            module_academy: true,
            flow_builder_access: true,
            flow_msg_access: true,
            flow_automation_access: true,
            flow_logic_access: true,
            commerce_access: true,
            accent_color: "#042F94",
            sort_order: 2,
            features_list: [
                "Everything in Starter",
                "CRM & Lead Management",
                "E-Commerce WhatsApp Shop",
                "Courses & Academy Engine",
                "Logic & Automation Nodes",
                "Shared Inbox (10 Agents)"
            ]
        }
    });

    // 3. ENTERPRISE
    await prisma.subscriptionPlan.upsert({
        where: { name: "ENTERPRISE" },
        update: {},
        create: {
            name: "ENTERPRISE",
            description: "Complete Whitelabel and API Integration suite.",
            monthly_price: 14999,
            original_monthly_price: 24999,
            yearly_price: 149999, // ~2 Months Free
            min_reseller_monthly_price: 7499, // 50% Margin Floor
            min_reseller_yearly_price: 74999,  // 50% Margin Floor
            currency: "INR",
            max_users: 50,
            max_contacts: 1000000,
            max_flows: 1000,
            module_drip: true,
            module_integration: true,
            flow_builder_access: true,
            flow_msg_access: true,
            flow_automation_access: true,
            flow_logic_access: true,
            flow_integration_access: true,
            api_access: true,
            accent_color: "#0F172A",
            badge_text: "Recommended",
            sort_order: 3,
            features_list: [
                "Everything in Growth",
                "Drip Message Sequences",
                "Advanced CRM Engine",
                "Integration Nodes (Webhooks/Shopify)",
                "Dedicated Success Manager",
                "Shared Inbox (50 Agents)"
            ]
        }
    });

    console.log("✅ Packages Seeded Successfully!");
}

main()
    .catch((e) => {
        console.error("❌ Seeding Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
