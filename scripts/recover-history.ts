/**
 * 📬 ATOMIC HISTORY RECOVERY SCRIPT
 * Finds and rescues all orphaned messages in 'Pending Connections'
 * and moves them into the correct connected workspace.
 * 
 * Run standalone: npx tsx scripts/recover-history.ts
 */

import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function recoverHistory() {
    console.log("📬 Starting History Recovery...");

    // Find all connected accounts
    const accounts = await prisma.whatsAppAccount.findMany({
        where: { status: "CONNECTED" },
        include: { workspace: true }
    });

    if (accounts.length === 0) {
        console.log("⚠️  No connected accounts found. Nothing to recover.");
        return;
    }

    // Also find 'Pending Connections' workspace
    const pendingWorkspace = await prisma.workspace.findFirst({
        where: { name: "Pending Connections" }
    });

    for (const account of accounts) {
        const targetWorkspaceId = account.workspace_id;
        console.log(`\n🔍 Checking for orphans for: ${account.display_name} (${account.phone_number})`);

        // Find any other accounts with the same phone that are in different workspaces
        const duplicateAccounts = await prisma.whatsAppAccount.findMany({
            where: {
                OR: [
                    { phone_number_id: account.phone_number_id },
                    { phone_number: account.phone_number }
                ],
                workspace_id: { not: targetWorkspaceId },
                id: { not: account.id }
            }
        });

        const sourceWorkspaceIds = new Set<string>(duplicateAccounts.map(a => a.workspace_id));
        if (pendingWorkspace) sourceWorkspaceIds.add(pendingWorkspace.id);

        if (sourceWorkspaceIds.size === 0) {
            console.log(`   ✅ No orphaned workspaces found.`);
            continue;
        }

        for (const sourceId of Array.from(sourceWorkspaceIds)) {
            if (sourceId === targetWorkspaceId) continue;
            console.log(`   🚛 Migrating from Workspace ID: ${sourceId}...`);

            // Move contacts safely
            const contacts = await prisma.contact.findMany({ where: { workspace_id: sourceId } });
            for (const c of contacts) {
                try {
                    await prisma.contact.update({ where: { id: c.id }, data: { workspace_id: targetWorkspaceId } });
                } catch {
                    // Duplicate — re-link its data to the existing contact
                    const existing = await prisma.contact.findFirst({
                        where: { workspace_id: targetWorkspaceId, phone: c.phone }
                    });
                    if (existing) {
                        await prisma.conversation.updateMany({ where: { contact_id: c.id }, data: { contact_id: existing.id, workspace_id: targetWorkspaceId } });
                        await prisma.message.updateMany({ where: { contact_id: c.id }, data: { contact_id: existing.id, workspace_id: targetWorkspaceId } });
                        try { await prisma.contact.delete({ where: { id: c.id } }); } catch {}
                    }
                }
            }

            // Sweep any remaining orphaned conversations and messages
            const { count: convCount } = await prisma.conversation.updateMany({
                where: { workspace_id: sourceId },
                data: { workspace_id: targetWorkspaceId }
            });
            const { count: msgCount } = await prisma.message.updateMany({
                where: { workspace_id: sourceId },
                data: { workspace_id: targetWorkspaceId }
            });

            console.log(`   ✅ Moved ${convCount} conversations, ${msgCount} messages.`);
        }

        // Clean up duplicate account records
        for (const dup of duplicateAccounts) {
            try { await prisma.whatsAppAccount.delete({ where: { id: dup.id } }); } catch {}
        }
    }

    await prisma.$disconnect();
    console.log("\n✅ History Recovery Complete!\n");
}

recoverHistory().catch(async (e) => {
    console.error("❌ Recovery script failed:", e);
    await prisma.$disconnect();
    process.exit(1);
});
