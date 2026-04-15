
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkRecentMessages() {
    console.log("Checking recent messages for media links...");
    const messages = await prisma.message.findMany({
        where: {
            type: "IMAGE"
        },
        orderBy: {
            created_at: "desc"
        },
        take: 5
    });

    messages.forEach(msg => {
        console.log(`ID: ${msg.id}`);
        console.log(`Type: ${msg.type}`);
        console.log(`Content: ${JSON.stringify(msg.content)}`);
        console.log(`Created At: ${msg.created_at}`);
        console.log("---");
    });
}

checkRecentMessages().catch(console.error).finally(() => prisma.$disconnect());
