import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { FlowRunner } from "../../../../lib/engine/flow-runner";
import { normalizeMessage } from "../../../../lib/engine/message-normalizer";
import { MediaCachingService } from "../../../../lib/whatsapp/media";

/**
 * 🚀 ATOMIC WHATSAPP WEBHOOK v3.0 [BSP MASTER VERSION]
 * Features:
 * - Dynamic ID Resolver (Handshake Bypass)
 * - Raw Formatting Stripping (Matches +91, 91, and spaces)
 * - Multi-Layer Entry Traversal (BSP Version compatibility)
 * - Conversation Heartbeat (Bumping the Inbox)
 * - Production Media Caching (Binary Persistence)
 */

export const dynamic = 'force-dynamic';

function normalizePhone(phone: string): string {
    return phone.replace(/\D/g, "");
}

// GET: Meta Verification Challenge
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const mode = searchParams.get("hub.mode");
        const token = searchParams.get("hub.verify_token");
        const challenge = searchParams.get("hub.challenge");
        const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN || "grafty_secure_token";

        // Bug #6 Fix: verify token MUST match before returning the challenge.
        // Previously any token was accepted, allowing anyone to register their own
        // Meta app against Grafty's webhook and receive all vendor message data.
        if (mode === "subscribe" && token === VERIFY_TOKEN) {
            return new Response(challenge || "", { status: 200, headers: { "Content-Type": "text/plain" } });
        }
        return new Response("Forbidden", { status: 403 });
    } catch (e) {
        return new Response("Error", { status: 500 });
    }
}

// POST: Incoming Events (Messages, Statuses)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const entries = body.entry || [];

        for (const entry of entries) {
            const changes = entry.changes || [];
            for (const change of changes) {
                if (change.field !== "messages") continue;

                const value = change.value;
                const metaPhoneId = value.metadata?.phone_number_id; 
                const rawDisplayPhone = value.metadata?.display_phone_number;
                const displayPhone = normalizePhone(rawDisplayPhone || "");

                let account = await prisma.whatsAppAccount.findFirst({
                    where: {
                        OR: [
                            { phone_number_id: metaPhoneId },
                            { phone_number: displayPhone }
                        ]
                    }
                });

                if (!account) continue;

                // 1. Process Messages
                if (value.messages) {
                    for (const msg of value.messages) {
                        try {
                            await handleIngestion(account, msg, value.contacts?.[0]);
                        } catch (err) {
                            console.error(`❌ [INGEST_ERR] MsgID: ${msg.id}`, err);
                        }
                    }
                }

                // 2. Process Statuses
                if (value.statuses) {
                    for (const status of value.statuses) {
                        try {
                            await handleStatus(account.workspace_id, status);
                        } catch (err) {
                            console.error(`❌ [STATUS_ERR] StatusID: ${status.id}`, err);
                        }
                    }
                }
            }
        }

        return NextResponse.json({ status: "success" });
    } catch (e: any) {
        console.error("📩 [WEBHOOK_CRITICAL_FAIL]:", e.message);
        return NextResponse.json({ error: "Internal Failure" }, { status: 500 });
    }
}

/**
 * Handle Single Message Ingestion
 * Optimized for Media Caching & Metadata Extraction
 */
async function handleIngestion(account: any, msg: any, metaContact: any) {
    const workspaceId = account.workspace_id;
    const rawSender = msg.from;
    const phone = normalizePhone(rawSender);
    const messageId = msg.id;
    const type = msg.type || "text";

    // 1. Resolve Media if present
    let mediaUrl: string | null = null;
    let mimeType: string | null = null;
    let fileName: string | null = null;
    let fileSize: number | null = null;
    let caption: string | null = null;

    const mediaObj = msg[type]; 
    if (mediaObj && mediaObj.id) {
        console.log(`📥 [INGEST_MEDIA] Resolving ${type} ID: ${mediaObj.id}...`);
        const localMedia = await MediaCachingService.getLocalUrl(mediaObj.id, account, workspaceId);
        if (localMedia) {
            mediaUrl = localMedia.url;
            mimeType = localMedia.mime_type;
            fileName = localMedia.file_name || null;
            fileSize = localMedia.file_size;
        }
        caption = mediaObj.caption || null;
    }

    // 2. Content Resolution (JSON backward compatibility)
    let content: any = {};
    if (msg.text) content = { body: msg.text.body };
    else if (msg.image) content = { media_id: msg.image.id, caption, mime_type: msg.image.mime_type, link: mediaUrl };
    else if (msg.video) content = { video: { id: msg.video.id, caption, mime_type: msg.video.mime_type, link: mediaUrl } };
    else if (msg.audio) content = { audio: { id: msg.audio.id, mime_type: msg.audio.mime_type, link: mediaUrl } };
    else if (msg.document) content = { document: { id: msg.document.id, filename: msg.document.filename, caption, mime_type: msg.document.mime_type, link: mediaUrl } };
    else if (msg.contacts) {
        const contactArr = msg.contacts || [];
        const first = contactArr[0] || {};
        content = {
            contacts: contactArr.map((c: any) => ({
                name: c.name?.formatted_name || c.name?.first_name || "Contact",
                phone: c.phones?.[0]?.phone || "No phone"
            }))
        };
    }
    else if (msg.interactive) content = msg.interactive;
    else if (msg.button) content = { button_text: msg.button.text, button_payload: msg.button.payload };
    else content = { raw: msg[type] || "Unsupported Type" };

    // 3. Contact Sync
    const contact = await prisma.contact.upsert({
        where: { workspace_id_phone: { workspace_id: workspaceId, phone } },
        update: { last_active_at: new Date(), name: metaContact?.profile?.name || undefined },
        create: { workspace_id: workspaceId, phone, name: metaContact?.profile?.name || "Customer", opt_in: true }
    });

    // 4. Conversation Heartbeat
    let conversation = await prisma.conversation.findFirst({
        where: { workspace_id: workspaceId, contact_id: contact.id, status: "OPEN" }
    });

    if (!conversation) {
        conversation = await prisma.conversation.create({
            data: { workspace_id: workspaceId, contact_id: contact.id, status: "OPEN" }
        });
    } else {
        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { updated_at: new Date() }
        });
    }

    // 5. Record Message with Production Metadata
    await prisma.message.create({
        data: {
            workspace_id: workspaceId,
            contact_id: contact.id,
            conversation_id: conversation.id,
            direction: "INBOUND",
            type: (type.toUpperCase()) as any,
            content,
            meta_id: messageId,
            status: "RECEIVED",
            media_url: mediaUrl,
            mime_type: mimeType,
            file_name: fileName,
            file_size: fileSize,
            caption: caption
        }
    });

    console.log(`📥 [INGEST_SUCCESS] ${type} LocalURL: ${mediaUrl || 'NONE'}`);

    // 6. Flow Engine Path
    FlowRunner.processMessage(workspaceId, contact.id, normalizeMessage(msg, { metadata: { phone_number_id: account.phone_number_id }, contacts: [metaContact] }))
        .catch(e => console.error("Flow Error:", e));
}

async function handleStatus(workspaceId: string, status: any) {
    const metaId = status.id;
    const newStatus = status.status.toUpperCase();
    
    let updateData: any = { status: newStatus };

    // ─── CAPTURE DELIVERY ERRORS ───
    if (newStatus === "FAILED" && status.errors && status.errors.length > 0) {
        const error = status.errors[0];
        updateData.error_code = `${error.code}`;
        updateData.error_message = error.message || error.title || "Meta rejected this message.";
        updateData.failed_at = new Date();
    } else if (newStatus === "DELIVERED") {
        updateData.delivered_at = new Date();
    } else if (newStatus === "READ") {
        updateData.read_at = new Date();
    } else if (newStatus === "SENT") {
        updateData.sent_at = new Date();
    }

    await prisma.message.updateMany({
        where: { workspace_id: workspaceId, meta_id: metaId },
        data: updateData
    });
}
