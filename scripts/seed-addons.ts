import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Seeding Addons Marketplace...");

    const addons = [
        {
            name: "META_FLOW_INTERACTIVE",
            title: "Meta Flow / Interactive Forms",
            description: "Unlock advanced WhatsApp Flows for automated data collection, bookings, and interactive forms.",
            price: 499, // ₹499 one-time or monthly depending on your logic
            icon: "Zap",
            category: "AUTOMATION"
        },
        {
            name: "AI_AGENT_AUTOPILOT",
            title: "AI Agent Autopilot",
            description: "Deploy an AI agent powered by GPT-4 to handle customer queries and lead qualification autonomously.",
            price: 1999,
            icon: "Bot",
            category: "AI"
        },
        {
            name: "BULK_CRM_PRO",
            title: "Bulk CRM Pro Tools",
            description: "Advanced CRM features including smart segmenting, custom fields, and bulk lead imports.",
            price: 299,
            icon: "Users",
            category: "CRM"
        },
        {
            name: "AI_KNOWLEDGE_ENGINE",
            title: "AI Knowledge Brain",
            description: "Train your AI on documents, URLs, and custom text to provide 100% accurate, rounded business support.",
            price: 399,
            icon: "Brain",
            category: "AI"
        },
        {
            name: "BULK_EMAIL_CHANNEL",
            title: "Bulk Email Campaign Hub",
            description: "Enterprise-grade email marketing with real-time tracking (Opens/Clicks) and automated multi-channel sequences.",
            price: 999,
            icon: "Send",
            category: "AUTOMATION"
        }
    ];

    for (const addon of addons) {
        await (prisma as any).addon.upsert({
            where: { name: addon.name },
            update: {
                title: addon.title,
                description: addon.description,
                price: addon.price,
                icon: addon.icon,
                category: (addon as any).category
            },
            create: {
                name: addon.name,
                title: addon.title,
                description: addon.description,
                price: addon.price,
                icon: addon.icon,
                category: (addon as any).category
            }
        });
        console.log(`✅ Upserted Addon: ${addon.title}`);
    }

    console.log("💎 Addons seeding complete!");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
