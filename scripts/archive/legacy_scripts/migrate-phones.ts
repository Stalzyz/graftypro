import { prisma } from '@/lib/db';
import { normalizePhone } from '@/lib/utils/phone';

/**
 * 🛠️ PRODUCTION HEALER (Atomic History Restoration)
 * This script sanitizes all existing phone numbers in the database.
 * 1. Normalize WhatsAppAccount.phone_number
 * 2. Normalize Contact.phone (with Conflict-Merge support)
 */
async function heal() {
    console.log("🩹 Starting Production Data Healing...");

    // --- 1. WHATSAPP ACCOUNTS ---
    const accounts = await prisma.whatsAppAccount.findMany();
    for (const acc of accounts) {
        const clean = normalizePhone(acc.phone_number);
        if (clean !== acc.phone_number) {
            console.log(`[ACC] ${acc.phone_number} -> ${clean}`);
            await prisma.whatsAppAccount.update({
                where: { id: acc.id },
                data: { phone_number: clean }
            });
        }
    }

    // --- 2. CONTACTS (Surgical Merge) ---
    const contacts = await prisma.contact.findMany();
    for (const c of contacts) {
        const clean = normalizePhone(c.phone);
        if (clean !== c.phone) {
            console.log(`[CON] ${c.phone} -> ${clean}`);
            
            // Check for potential duplicate in the same workspace
            const existing = await prisma.contact.findFirst({
                where: { workspace_id: c.workspace_id, phone: clean, id: { not: c.id } }
            });

            if (existing) {
                console.log(`🚛 [MERGE] Duplicate detected for ${clean}. Moving history...`);
                // Move Conversations
                await prisma.conversation.updateMany({
                    where: { contact_id: c.id },
                    data: { contact_id: existing.id }
                });
                // Move Messages
                await prisma.message.updateMany({
                    where: { contact_id: c.id },
                    data: { contact_id: existing.id }
                });
                // Clean up the duplicate contact
                await prisma.contact.delete({ where: { id: c.id } });
            } else {
                // Safe update
                await prisma.contact.update({
                    where: { id: c.id },
                    data: { phone: clean }
                });
            }
        }
    }

    console.log("✅ Healing Complete! All records now match the Master standard.");
}

heal().catch((err) => {
    console.error("❌ Healing Failed:", err);
    process.exit(1);
});
