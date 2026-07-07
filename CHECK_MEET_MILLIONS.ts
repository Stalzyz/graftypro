const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const acc = await prisma.whatsAppAccount.findFirst({
        where: { display_name: { contains: "Meet Millions", mode: "insensitive" } },
        include: { workspace: true }
    });
    console.log(acc ? JSON.stringify(acc, null, 2) : "Not found");
}

main().finally(() => prisma.$disconnect());
