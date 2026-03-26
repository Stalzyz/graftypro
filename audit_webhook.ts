
import { prisma } from './lib/db';

async function check() {
    console.log("🔍 [Audit] Checking last 5 Inbound Messages...");
    const messages = await prisma.message.findMany({
        where: { direction: 'INBOUND' },
        orderBy: { created_at: 'desc' },
        take: 5
    });

    if (messages.length === 0) {
        console.log("❌ NO Inbound messages in DB.");
    } else {
        messages.forEach(m => console.log(`📥 REC: ${m.created_at.toISOString()} | Phone: ${m.contact_id} | Status: ${m.status}`));
    }
}

check().catch(console.error);
