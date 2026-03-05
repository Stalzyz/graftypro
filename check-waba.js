
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const accounts = await prisma.whatsAppAccount.findMany({
        select: {
            id: true,
            waba_id: true,
            phone_number_id: true,
            phone_number: true,
            workspace_id: true,
            integration_status: true,
            status: true
        }
    });
    console.log(JSON.stringify(accounts, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
