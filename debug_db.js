
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const msgs = await prisma.message.findMany({
            orderBy: { created_at: 'desc' },
            take: 10
        });
        console.log(JSON.stringify(msgs, null, 2));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
