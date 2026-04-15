import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function run() {
    const waba = await prisma.whatsAppAccount.findFirst({
        include: { workspace: true }
    });

    if (!waba) {
        console.error("No WABA found for testing.");
        process.exit(1);
    }
    console.log(`WABA ID: ${waba.phone_number_id}`);
}
run();
