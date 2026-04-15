
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    console.log("Checking latest messages...");

    // 1. Get stats
    console.log("--- STATS ---");
    const msgCount = await prisma.message.count();
    const contactCount = await prisma.contact.count();
    const convCount = await prisma.conversation.count();
    console.log(`Total Messages: ${msgCount}`);
    console.log(`Total Contacts: ${contactCount}`);
    console.log(`Total Conversations: ${convCount}`);

    // 2. Get latest messages
    console.log("\n--- LATEST 5 MESSAGES ---");
    const messages = await prisma.message.findMany({
        take: 5,
        orderBy: { created_at: 'desc' },
        include: { conversation: true, contact: true }
    });

    messages.forEach(m => {
        console.log(`[${m.created_at.toISOString()}] From: ${m.contact.name} (${m.contact.phone}) | Type: ${m.type} | Content:`, m.content);
        console.log(`   -> Conv ID: ${m.conversation_id}`);
    });

    // 3. Check Workspace ownership
    if (messages.length > 0) {
        const workspaceId = messages[0].workspace_id;
        console.log(`\n--- WORKSPACE CHECK (${workspaceId}) ---`);
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            include: { users: true }
        });
        console.log("Workspace Name:", workspace?.name);
        console.log("Users in this workspace:", workspace?.users.map(u => `${u.email} (${u.role})`));
    }
}

main()
    .catch(console.error)
    .finally(async () => await prisma.$disconnect());
