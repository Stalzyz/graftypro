const { PrismaClient } = require('./lib/generated/client');
const prisma = new PrismaClient();
async function main() {
    const accs = await prisma.whatsAppAccount.findMany({ where: { display_name: { contains: 'Pummy', mode: 'insensitive' } } });
    console.log(JSON.stringify(accs, null, 2));
}
main().finally(() => prisma.$disconnect());
