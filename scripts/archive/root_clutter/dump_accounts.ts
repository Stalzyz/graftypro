
import { prisma } from './lib/db';

async function dump() {
    const accounts = await prisma.whatsAppAccount.findMany({
        select: {
            workspace_id: true,
            phone_number_id: true,
            waba_id: true,
            phone_number: true,
            display_name: true,
            integration_status: true
        }
    });
    console.log("--- WhatsApp Accounts Dump ---");
    accounts.forEach(a => console.log(`[ACC] ${a.display_name} | ID: ${a.phone_number_id} | Phone: ${a.phone_number} | Status: ${a.integration_status}`));
}

dump().catch(console.error);
