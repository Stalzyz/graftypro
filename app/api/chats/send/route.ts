
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";
import { WhatsAppService } from "../../../../lib/whatsapp/service";
import { decrypt } from "../../../../lib/security/encryption";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { conversationId, text, type = "text", template } = body;

        // 1. Fetch Conversation & Contact
        const conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { contact: true }
        });

        if (!conversation || conversation.workspace_id !== user.workspaceId) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        // 2. Fetch WhatsApp Credentials
        // Fix: Query by workspace_id, not status (schema doesn't have status on WABA yet, or check later)
        const waba = await prisma.whatsAppAccount.findUnique({
            where: { workspace_id: user.workspaceId }
        });

        if (!waba || !waba.access_token || !waba.phone_number_id) {
            return NextResponse.json({ error: "WhatsApp account not connected" }, { status: 400 });
        }

        // 3. ENTERPRISE CREDIT SYSTEM (Phase 3 & 4)
        // A. Identify Price (Country + Category)
        const { CreditService } = require("@/lib/credits/service");
        const countryCode = conversation.contact.phone.replace(/[^0-9]/g, "").substring(0, 2);
        const category = type === 'template' ? "MARKETING" : "SERVICE"; // Simplified for chat
        const cost = await CreditService.getMessageCost(category, countryCode);

        // B. Atomic Deduction Transaction
        await prisma.$transaction(async (tx) => {
            await CreditService.deductCredits(
                tx,
                user.workspaceId,
                cost,
                `PENDING-${Date.now()}`,
                `Manual Message (${type})`
            );
        });

        // 4. Send Message via Meta API
        let metaId = null;
        let finalContent = {};
        const token = decrypt(waba.access_token);

        try {
            if (type === 'template' && template) {
                const res = await WhatsAppService.sendTemplate(
                    waba.phone_number_id,
                    token,
                    conversation.contact.phone,
                    template.name,
                    template.language?.code || "en"
                );
                metaId = res?.messages?.[0]?.id;
                finalContent = { body: `Template: ${template.name}` };
            } else if (text) {
                const res = await WhatsAppService.sendText(
                    waba.phone_number_id,
                    token,
                    conversation.contact.phone,
                    text
                );
                metaId = res?.messages?.[0]?.id;
                finalContent = { body: text };
            }
        } catch (apiError) {
            console.error("Meta API Failed, but credits were deducted (System Policy)");
            // In a more advanced version, we would queue a refund here.
        }

        // 5. Save Outbound Message to DB
        const message = await prisma.message.create({
            data: {
                workspace_id: user.workspaceId,
                conversation_id: conversationId,
                contact_id: conversation.contact_id,
                direction: "OUTBOUND",
                type: type === 'template' ? "TEMPLATE" : "TEXT",
                content: finalContent,
                status: metaId ? "SENT" : "FAILED",
                meta_id: metaId
            }
        });

        // 6. Update Conversation timestamp
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updated_at: new Date() }
        });

        return NextResponse.json(message);

    } catch (error: any) {
        console.error("Send Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
