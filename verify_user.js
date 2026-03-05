
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'vendor3@test.com';
    const user = await prisma.user.updateMany({
        where: { email },
        data: { email_verified: new Date() }
    });
    console.log(`Updated ${user.count} user(s)`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
