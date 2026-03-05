
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCurrentUser } from "../../../../../lib/auth";
import { WhatsAppService } from "../../../../../lib/whatsapp/service";
import { decrypt } from "../../../../../lib/security/encryption";
import { getAbsoluteMediaUrl } from "../../../../../lib/utils/url";

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const messages = await prisma.message.findMany({
            where: {
                conversation_id: params.id,
                workspace_id: user.workspaceId
            },
            orderBy: { created_at: "asc" }
        });

        // Mark messages as read if they were inbound
        await prisma.message.updateMany({
            where: {
                conversation_id: params.id,
                direction: "INBOUND",
                status: { not: "READ" }
            },
            data: { status: "READ" }
        });

        return NextResponse.json({ data: messages });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { text, mediaUrl, mediaType, filename } = await req.json();

        const conversation = await prisma.conversation.findUnique({
            where: { id: params.id },
            include: {
                contact: true,
                workspace: { include: { waba: true } }
            }
        });

        if (!conversation || conversation.workspace_id !== user.workspaceId) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        const waba = conversation.workspace.waba;
        if (!waba) return NextResponse.json({ error: "WhatsApp account not found" }, { status: 400 });

        const token = decrypt(waba.access_token);
        let response: any;
        let type: string = "TEXT";
        let content: any = { body: text };

        const absoluteMediaUrl = getAbsoluteMediaUrl(mediaUrl, req);
        if (mediaUrl) {
            console.log(`[WA_SEND] Media detected. Source: ${mediaUrl}, Absolute: ${absoluteMediaUrl}`);
        }

        // Send the message first (delivery is never blocked by billing)
        if (mediaUrl) {
            if (mediaType === "IMAGE") {
                response = await WhatsAppService.sendImage(waba.phone_number_id, token, conversation.contact.phone, absoluteMediaUrl, text);
                type = "IMAGE";
                content = { link: mediaUrl, caption: text };
            } else {
                response = await WhatsAppService.sendDocument(waba.phone_number_id, token, conversation.contact.phone, absoluteMediaUrl, filename || "document.pdf");
                type = "DOCUMENT";
                content = { link: mediaUrl, filename: filename || "document.pdf", caption: text };
            }
        } else {
            if (!text) return NextResponse.json({ error: "Text is required" }, { status: 400 });
            response = await WhatsAppService.sendText(waba.phone_number_id, token, conversation.contact.phone, text);
        }

        const metaId = response?.messages?.[0]?.id;

        // 💳 Credit Deduction — best-effort, non-blocking, runs after successful send
        const workspaceIdForCredit = user.workspaceId;
        const contactPhone = conversation.contact.phone;
        setImmediate(async () => {
            try {
                const { CreditService } = await import("../../../../../lib/credits/service");
                const category = "SERVICE";
                const countryCode = (contactPhone || "91").substring(0, 2);
                const cost = await CreditService.getMessageCost(category, countryCode, workspaceIdForCredit).catch(() => 0);
                if (cost <= 0) return;

                await CreditService.deductCreditsAtomic(
                    workspaceIdForCredit,
                    cost,
                    `chat_${conversation.id}_${metaId || Date.now()}`,
                    metaId || null,
                    category,
                    countryCode,
                    `Live Chat: ${category}`
                );
            } catch (e: any) {
                console.error("[CreditLedger] Chat deduction error (non-fatal):", e?.message);
            }
        });

        // Human Intervention: Close any active flow sessions
        try {
            await prisma.flowSession.updateMany({
                where: { contact_id: conversation.contact_id, is_completed: false },
                data: {
                    is_completed: true,
                    state: { closed_reason: "HUMAN_INTERVENTION" } as any
                }
            });
            console.log(`[FlowEngine] 🔒 Session closed due to human intervention for contact ${conversation.contact_id}`);
        } catch (e) {
            console.error("Failed to close flow session:", e);
        }

        // 2. Save Outbound Message
        const message = await prisma.message.create({
            data: {
                workspace_id: user.workspaceId,
                contact_id: conversation.contact_id,
                conversation_id: conversation.id,
                meta_id: metaId || `manual_${Date.now()}`,
                type: type as any,
                direction: "OUTBOUND",
                content: content,
                status: "SENT"
            }
        });

        // Update conversation last active
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { updated_at: new Date() }
        });

        return NextResponse.json({ success: true, data: message });

    } catch (error: any) {
        console.error("Send Message Error:", error);
        return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await prisma.message.deleteMany({
            where: {
                conversation_id: params.id,
                workspace_id: user.workspaceId
            }
        });

        return NextResponse.json({ success: true, message: "Conversation cleared" });
    } catch (error) {
        console.error("Clear Conversation Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
