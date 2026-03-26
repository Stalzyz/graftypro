
import { prisma } from './lib/db';

async function cleanup() {
    console.log("🛠️ Starting Database Phone Normalization...");
    
    // 1. WhatsApp Accounts
    const accounts = await prisma.whatsAppAccount.findMany();
    for (const acc of accounts) {
        const clean = acc.phone_number.replace(/\D/g, "");
        if (clean !== acc.phone_number) {
            console.log(`[ACC] ${acc.phone_number} -> ${clean}`);
            await prisma.whatsAppAccount.update({
                where: { id: acc.id },
                data: { phone_number: clean }
            });
        }
    }
    
    // 2. Contacts (Heavy Lift)
    const contacts = await prisma.contact.findMany();
    for (const c of contacts) {
        const clean = c.phone.replace(/\D/g, "");
        if (clean !== c.phone) {
            console.log(`[CON] ${c.phone} -> ${clean}`);
            // Check if clean already exists to avoid unique constraint violations
            const exists = await prisma.contact.findFirst({
                where: { workspace_id: c.workspace_id, phone: clean }
            });
            
            if (exists) {
                console.log(`[CON] Merge required for ${clean} in workspace ${c.workspace_id}`);
                // Simple cleanup: delete the old one if it's the duplicate
                await prisma.contact.delete({ where: { id: c.id } });
            } else {
                await prisma.contact.update({
                    where: { id: c.id },
                    data: { phone: clean }
                });
            }
        }
    }
    
    console.log("✅ Database Cleaned!");
}

cleanup().catch(console.error);
