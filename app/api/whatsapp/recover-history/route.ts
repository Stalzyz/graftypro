import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

/**
 * 🚑 ATOMIC HISTORY RECOVERY API
 * This endpoint finds all messages orphaned in 'Pending Connections' or
 * any other unlinked workspace and moves them into the current user's workspace.
 * 
 * This is a one-click "Rescue My History" operation.
 */
export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        console.log(`🚑 [HISTORY_RECOVERY] Starting for Workspace: ${user.workspaceId}`);

        // 1. Find the connected WhatsApp account for this workspace
        const myAccount = await prisma.whatsAppAccount.findUnique({
            where: { workspace_id: user.workspaceId }
        });

        if (!myAccount) {
            return NextResponse.json({ error: "No WhatsApp account connected to this workspace." }, { status: 404 });
        }

        // 2. Find all OTHER accounts with the same phone number or phone ID
        const orphanedAccounts = await prisma.whatsAppAccount.findMany({
            where: {
                OR: [
                    { phone_number_id: myAccount.phone_number_id },
                    { phone_number: myAccount.phone_number }
                ],
                workspace_id: { not: user.workspaceId },
                id: { not: myAccount.id }
            },
            include: { workspace: true }
        });

        // 3. Also find 'Pending Connections' workspace explicitly
        const pendingWorkspace = await prisma.workspace.findFirst({
            where: { name: "Pending Connections" }
        });

        const targetWorkspaceIds = new Set<string>(
            orphanedAccounts.map(a => a.workspace_id)
        );
        if (pendingWorkspace) {
            targetWorkspaceIds.add(pendingWorkspace.id);
        }

        if (targetWorkspaceIds.size === 0) {
            return NextResponse.json({ 
                success: true, 
                message: "No orphaned history found. System is clean.",
                moved: { contacts: 0, conversations: 0, messages: 0 }
            });
        }

        console.log(`🔍 [HISTORY_RECOVERY] Found ${targetWorkspaceIds.size} workspace(s) to recover from`);

        let totalContactsMoved = 0;
        let totalConvMoved = 0;
        let totalMsgMoved = 0;

        for (const sourceWorkspaceId of Array.from(targetWorkspaceIds)) {
            console.log(`🚛 [HISTORY_RECOVERY] Migrating from: ${sourceWorkspaceId}...`);

            // Get all contacts from the source workspace
            const orphanContacts = await prisma.contact.findMany({
                where: { workspace_id: sourceWorkspaceId }
            });

            for (const c of orphanContacts) {
                try {
                    // Try to move the contact directly
                    await prisma.contact.update({
                        where: { id: c.id },
                        data: { workspace_id: user.workspaceId }
                    });
                    totalContactsMoved++;
                } catch (dupErr) {
                    // Contact already exists in target workspace — find it and re-link data
                    const existing = await prisma.contact.findFirst({
                        where: { workspace_id: user.workspaceId, phone: c.phone }
                    });
                    if (existing) {
                        // Re-link conversations and messages to the existing contact
                        const convResult = await prisma.conversation.updateMany({
                            where: { contact_id: c.id },
                            data: { contact_id: existing.id, workspace_id: user.workspaceId }
                        });
                        const msgResult = await prisma.message.updateMany({
                            where: { contact_id: c.id },
                            data: { contact_id: existing.id, workspace_id: user.workspaceId }
                        });
                        totalConvMoved += convResult.count;
                        totalMsgMoved += msgResult.count;
                        // Remove the duplicate contact
                        try { await prisma.contact.delete({ where: { id: c.id } }); } catch {}
                    }
                }
            }

            // Sweep any remaining orphaned conversations/messages that weren't linked to contacts
            const orphanedConvs = await prisma.conversation.updateMany({
                where: { workspace_id: sourceWorkspaceId },
                data: { workspace_id: user.workspaceId }
            });

            const orphanedMsgs = await prisma.message.updateMany({
                where: { workspace_id: sourceWorkspaceId },
                data: { workspace_id: user.workspaceId }
            });

            totalConvMoved += orphanedConvs.count;
            totalMsgMoved += orphanedMsgs.count;

            // Clean up orphaned whatsapp account records
            for (const oldAcc of orphanedAccounts) {
                if (oldAcc.workspace_id === sourceWorkspaceId) {
                    try { await prisma.whatsAppAccount.delete({ where: { id: oldAcc.id } }); } catch {}
                }
            }
        }

        console.log(`✅ [HISTORY_RECOVERY] Done! Moved ${totalContactsMoved} contacts, ${totalConvMoved} convs, ${totalMsgMoved} messages`);

        return NextResponse.json({
            success: true,
            message: "History recovery complete! All orphaned messages have been moved to your inbox.",
            moved: {
                contacts: totalContactsMoved,
                conversations: totalConvMoved,
                messages: totalMsgMoved
            }
        });

    } catch (error: any) {
        console.error("❌ [HISTORY_RECOVERY_FAIL]:", error);
        return NextResponse.json({ error: error.message || "Recovery Failed" }, { status: 500 });
    }
}
