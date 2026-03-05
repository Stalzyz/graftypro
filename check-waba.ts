
import { prisma } from "./lib/db";

async function checkAccounts() {
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

checkAccounts()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
