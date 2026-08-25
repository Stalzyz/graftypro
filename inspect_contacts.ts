import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const WORKSPACE_ID = "89b6c788-d842-4bf6-8af9-bc02e84e76d2";

async function main() {
    const contacts = await prisma.contact.findMany({
        where: { workspace_id: WORKSPACE_ID },
        select: { id: true, name: true, phone: true, tags: true },
        take: 15
    });
    console.log("Total contacts count:", await prisma.contact.count({ where: { workspace_id: WORKSPACE_ID } }));
    console.log("Sample contacts:", JSON.stringify(contacts, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
