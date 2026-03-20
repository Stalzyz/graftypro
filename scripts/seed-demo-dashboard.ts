// scripts/seed-demo-dashboard.ts
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

async function main() {
    console.log("🌱 Injecting high-quality dummy data for Demo Dashboard...");

    // 1. Find the Demo User and Workspace
    const user = await db.user.findFirst({ where: { email: 'demo@grafty.com' }, include: { workspace: true } });
    if (!user || !user.workspace_id) {
        console.error("❌ Demo user or workspace not found. Please run the demo creator first.");
        return;
    }

    const wsId = user.workspace_id;
    console.log(`Found Workspace ID: ${wsId}`);

    // Clear existing dummy data (optional, to avoid infinite snowballing)
    await db.contact.deleteMany({ where: { workspace_id: wsId } });

    // 2. Inject Contacts
    console.log("➕ Creating 15 realistically named Contacts...");
    const dummyNames = [
        "Alex Rodriguez", "Sarah Jenkins", "Michael Chen", "Emma Watson",
        "David Kim", "Jessica Taylor", "Ryan Matthews", "Olivia Parker",
        "Daniel Evans", "Sophia Nguyen", "James White", "Isabella Carter",
        "William Brooks", "Mia Rivera", "Benjamin Hayes"
    ];

    const contacts = [];
    for (let i = 0; i < dummyNames.length; i++) {
        // Random country codes & realistic looking numbers
        const phone = `+1${Math.floor(1000000000 + Math.random() * 9000000000)}`;
        const contact = await db.contact.create({
            data: {
                workspace_id: wsId,
                name: dummyNames[i],
                phone: phone,
                opt_in: true,
                tags: ["web-lead", "q3-campaign"]
            }
        });
        contacts.push(contact);
    }

    // 3. Inject Campaigns (Broadcasts)
    console.log("➕ Creating Past Broadcast Campaigns for Overview Charts...");
    const campaign1 = await db.campaign.create({
        data: {
            workspace_id: wsId,
            name: "Black Friday Special Offer",
            template_id: "tmp_bf_01",
            status: "COMPLETED",
            scheduled_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            filters: { tags: ["VIP", "Engaged"] },
            stats: {
                create: {
                    total: 15420,
                    sent: 15398,
                    delivered: 15201,
                    read: 11450,
                    failed: 22,
                    replied: 0
                }
            }
        }
    });

    await db.campaign.create({
        data: {
            workspace_id: wsId,
            name: "Newsletter Q2 Recap",
            template_id: "tmp_nl_q2",
            status: "COMPLETED",
            scheduled_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
            filters: { tags: ["All"] },
            stats: {
                create: {
                    total: 8500,
                    sent: 8490,
                    delivered: 8400,
                    read: 6200,
                    failed: 10,
                    replied: 0
                }
            }
        }
    });

    // 4. Inject Conversations & Live Chat Messages
    console.log("➕ Creating Active Live Chat Conversations...");
    for (let i = 0; i < 3; i++) {
        const contact = contacts[i];

        const conversation = await db.conversation.create({
            data: {
                workspace_id: wsId,
                contact_id: contact.id,
                status: i === 0 ? "OPEN" : "RESOLVED",
                assigned_to: user.id
            }
        });

        // Add 3 dummy messages to each conversation
        await db.message.createMany({
            data: [
                {
                    workspace_id: wsId,
                    conversation_id: conversation.id,
                    contact_id: contact.id,
                    direction: "INBOUND",
                    content: { text: "Hi, I have a question about the Pro plan features." },
                    status: "DELIVERED",
                    type: "TEXT"
                },
                {
                    workspace_id: wsId,
                    conversation_id: conversation.id,
                    contact_id: contact.id,
                    direction: "OUTBOUND",
                    content: { text: "Hello! I'd be happy to help. Which specific features are you looking for?" },
                    status: "READ",
                    type: "TEXT"
                },
                {
                    workspace_id: wsId,
                    conversation_id: conversation.id,
                    contact_id: contact.id,
                    direction: "INBOUND",
                    content: { text: "Mainly the CRM and Flow Builder integrations limits." },
                    status: "DELIVERED",
                    type: "TEXT"
                }
            ]
        });
    }

    console.log("✅ Dashboard Dummy Data Seeded Successfully!");
    await db.$disconnect();
}

main().catch(console.error);
