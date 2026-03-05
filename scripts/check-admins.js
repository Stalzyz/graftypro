
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const admins = await prisma.adminUser.findMany();
    console.log("Total Admin Users:", admins.length);
    admins.forEach(admin => {
        console.log(`- Email: ${admin.email}, Role: ${admin.role}`);
    });
}

main().catch(console.error).finally(() => prisma.$disconnect());
