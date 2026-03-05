
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCurrentUser } from "../../../../../lib/auth";
import { WhatsAppService } from "../../../../../lib/whatsapp/service";
import { decrypt } from "../../../../../lib/security/encryption";

export const dynamic = "force-dynamic";

/**
 * Handles message deletion (for me or for all)
 */
export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { messageId, deleteForAll = false } = await req.json();
        if (!messageId) return NextResponse.json({ error: "Message ID required" }, { status: 400 });

        // 1. Fetch Message
        const message = await prisma.message.findUnique({
            where: { id: messageId },
            include: { conversation: true }
        });

        if (!message || message.workspace_id !== user.workspaceId) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }

        // 2. Handle Deletion Logic
        if (deleteForAll && message.direction === 'OUTBOUND' && message.meta_id) {
            // A. Attempt to revoke via Meta API
            const waba = await prisma.whatsAppAccount.findUnique({
                where: { workspace_id: user.workspaceId }
            });

            if (waba && waba.access_token && waba.phone_number_id) {
                const token = decrypt(waba.access_token);
                try {
                    await WhatsAppService.revokeMessage(waba.phone_number_id, token, message.meta_id);
                } catch (metaErr: any) {
                    console.error("Meta Revoke Error:", metaErr.response?.data || metaErr.message);
                    // If Meta fails (e.g. > 30 days), we can't delete for all, but we continue with local delete?
                    // Or let user know.
                }
            }
        }

        // B. Update/Delete in Local DB
        // For "Delete for me", we might want to just flag it, 
        // but for now we'll permanently delete from DB for simplicity 
        // (as this is a shared inbox for the workspace).
        await prisma.message.delete({
            where: { id: messageId }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Message Delete Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
