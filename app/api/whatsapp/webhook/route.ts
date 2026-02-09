import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { FlowRunner } from "@/lib/engine/flow-runner";

export const dynamic = 'force-dynamic';

/**
 * PHASE 8: Meta WhatsApp Webhook Handler
 * Handles: Verification, Incoming Messages, Message Status Updates
 */

// GET: Webhook Verification (Meta Challenge)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        console.log("✅ Webhook Verified");
        return new Response(challenge, { status: 200 });
    }

    return NextResponse.json({ error: "Verification Failed" }, { status: 403 });
}

// POST: Incoming Events (Messages, Status Updates)
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Log for debugging
        console.log("📩 Webhook Event:", JSON.stringify(body, null, 2));

        // Meta sends events in batches
        const entry = body.entry?.[0];
        if (!entry) return NextResponse.json({ status: "ignored" });

        const changes = entry.changes || [];

        for (const change of changes) {
            if (change.field !== "messages") continue;

            const value = change.value;
            const wabaId = value.metadata?.phone_number_id;

            // Find workspace by phone_number_id
            const account = await prisma.whatsAppAccount.findFirst({
                where: { phone_number_id: wabaId }
            });

            if (!account) {
                console.warn(`No workspace found for WABA Phone ID: ${wabaId}`);
                continue;
            }

            const workspaceId = account.workspace_id;

            // Process Messages
            if (value.messages) {
                for (const msg of value.messages) {
                    await handleIncomingMessage(workspaceId, msg, value.contacts?.[0]);
                }
            }

            // Process Status Updates
            if (value.statuses) {
                for (const status of value.statuses) {
                    await handleStatusUpdate(workspaceId, status);
                }
            }
        }

        return NextResponse.json({ status: "ok" });

    } catch (e) {
        console.error("Webhook Error:", e);
        return NextResponse.json({ error: "Processing Failed" }, { status: 500 });
    }
}

/**
 * Handle Incoming Message
 */
async function handleIncomingMessage(workspaceId: string, msg: any, contact: any) {
    const phone = msg.from;
    const messageId = msg.id;
    const timestamp = new Date(parseInt(msg.timestamp) * 1000);

    // Determine message type
    let type = "TEXT";
    let content: any = {};

    if (msg.text) {
        type = "TEXT";
        content = { text: msg.text.body };
    } else if (msg.image) {
        type = "IMAGE";
        content = { media_id: msg.image.id, caption: msg.image.caption };
    } else if (msg.document) {
        type = "DOCUMENT";
        content = { media_id: msg.document.id, filename: msg.document.filename };
    } else if (msg.audio) {
        type = "AUDIO";
        content = { media_id: msg.audio.id };
    } else if (msg.video) {
        type = "VIDEO";
        content = { media_id: msg.video.id };
    } else if (msg.interactive) {
        type = "INTERACTIVE";
        content = msg.interactive;
    } else if (msg.button) {
        type = "INTERACTIVE";
        content = { button_text: msg.button.text, button_payload: msg.button.payload };
    }

    // Extract Message Body for Flow Engine
    let messageBody = "";
    if (msg.text) messageBody = msg.text.body;
    else if (msg.interactive) {
        if (msg.interactive.type === "list_reply") messageBody = `LIST_SELECT_ID:${msg.interactive.list_reply.id}`;
        else if (msg.interactive.type === "button_reply") messageBody = msg.interactive.button_reply.id;
    } else if (msg.button) {
        messageBody = msg.button.payload;
    }

    // Upsert Contact
    const contactData = await prisma.contact.upsert({
        where: {
            workspace_id_phone: { workspace_id: workspaceId, phone }
        },
        update: {
            name: contact?.profile?.name || undefined,
            last_active_at: timestamp
        },
        create: {
            workspace_id: workspaceId,
            phone,
            name: contact?.profile?.name || undefined
        }
    });

    // Create or find conversation
    let conversation = await prisma.conversation.findFirst({
        where: { workspace_id: workspaceId, contact_id: contactData.id, status: "OPEN" }
    });

    if (!conversation) {
        conversation = await prisma.conversation.create({
            data: { workspace_id: workspaceId, contact_id: contactData.id, status: "OPEN" }
        });
    }

    // Create Message Record
    await prisma.message.create({
        data: {
            workspace_id: workspaceId,
            contact_id: contactData.id,
            conversation_id: conversation.id,
            direction: "INBOUND",
            type: type as any,
            content,
            meta_id: messageId,
            status: "RECEIVED"
        }
    });

    console.log(`📥 Saved Message from ${phone}: ${type}`);

    // 🔥 Trigger Flow Engine
    try {
        if (messageBody) {
            await FlowRunner.processMessage(workspaceId, contactData.id, messageBody);
        }
    } catch (flowError) {
        console.error("Flow Engine Error:", flowError);
    }
}

/**
 * Handle Message Status Updates (sent, delivered, read, failed)
 */
async function handleStatusUpdate(workspaceId: string, status: any) {
    const waMessageId = status.id;
    const newStatus = status.status.toUpperCase(); // sent, delivered, read, failed

    // Update message status
    await prisma.message.updateMany({
        where: {
            workspace_id: workspaceId,
            meta_id: waMessageId
        },
        data: {
            status: newStatus
        }
    });

    console.log(`📊 Status Update: ${waMessageId} -> ${newStatus}`);
}
