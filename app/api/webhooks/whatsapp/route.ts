import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// 1. Verification Challenge (GET)
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const VERIFY_TOKEN = process.env.META_WEBHOOK_VERIFY_TOKEN;

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
        return new NextResponse(challenge, { status: 200 });
    }

    return new NextResponse("Forbidden", { status: 403 });
}

// 2. Event Ingestion (POST)
export async function POST(req: Request) {
    const startTime = Date.now();
    try {
        const body = await req.json();

        // 1. Immediate 200 OK (Important for Meta)
        // We strictly should process async, but for MVP we do simplified logic here.
        // Ideally: Push 'body' to Redis Queue -> Return 200 -> Worker processes it.

        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        if (!value) return NextResponse.json({ status: "ignored" });

        // Handle Template Status Updates
        if (changes?.field === "message_template_status_update") {
            const { event, message_template_name, message_template_language } = value;
            const wabaIdFromMeta = entry.id;

            const waba = await prisma.whatsAppAccount.findFirst({
                where: { waba_id: wabaIdFromMeta }
            });

            if (waba) {
                await prisma.template.updateMany({
                    where: {
                        workspace_id: waba.workspace_id,
                        name: message_template_name,
                        language: message_template_language
                    },
                    data: {
                        status: event as any
                    }
                });
                return NextResponse.json({ status: "template_updated" });
            }
        }

        // Handle Messages
        if (value.messages) {
            const message = value.messages[0];
            const contactProfile = value.contacts?.[0];
            const wabaId = value.metadata?.phone_number_id;

            // A. Find Workspace by WABA ID
            // In a real scenario, we cache this mapping.
            const waba = await prisma.whatsAppAccount.findUnique({
                where: { phone_number_id: wabaId },
                include: { workspace: true },
            });

            if (waba) {
                // B. Find/Create Contact
                const phone = message.from;

                const contact = await prisma.contact.upsert({
                    where: {
                        workspace_id_phone: {
                            workspace_id: waba.workspace_id,
                            phone: phone,
                        },
                    },
                    update: {
                        name: contactProfile?.profile?.name || undefined,
                    },
                    create: {
                        workspace_id: waba.workspace_id,
                        phone: phone,
                        name: contactProfile?.profile?.name || "Unknown",
                    },
                });

                // C. Log Conversation Event (Simplified)
                // In real system: check if existing conversation is open, else open new.
                let conversation = await prisma.conversation.findFirst({
                    where: {
                        contact_id: contact.id,
                        status: "OPEN",
                    },
                });

                if (!conversation) {
                    conversation = await prisma.conversation.create({
                        data: {
                            workspace_id: waba.workspace_id,
                            contact_id: contact.id,
                            status: "OPEN"
                        }
                    });
                } else {
                    // Update timestamp to bring to top of inbox
                    await prisma.conversation.update({
                        where: { id: conversation.id },
                        data: { updated_at: new Date() }
                    });
                }

                // C2. Save Message (Timeline)
                let msgType = "TEXT";
                let msgContent = {};

                if (message.text) {
                    msgType = "TEXT";
                    msgContent = { body: message.text.body };
                } else if (message.image) {
                    msgType = "IMAGE";
                    msgContent = message.image;
                } else if (message.interactive) {
                    msgType = "INTERACTIVE";
                    msgContent = message.interactive;
                } else {
                    msgType = "UNKNOWN";
                    msgContent = { raw: message };
                }

                // @ts-ignore
                await prisma.message.create({
                    data: {
                        workspace_id: waba.workspace_id,
                        contact_id: contact.id,
                        conversation_id: conversation.id,
                        meta_id: message.id,
                        type: msgType as any, // Enum
                        direction: "INBOUND",
                        content: msgContent,
                        status: "DELIVERED"
                    }
                });

                // Update Contact Last Active
                await prisma.contact.update({
                    where: { id: contact.id },
                    // @ts-ignore
                    data: { last_active_at: new Date() }
                });

                // D. Consent Engine (Phase 2)
                const textBody = message.text?.body?.toLowerCase()?.trim();

                // STOP DROPS ON REPLY (Intelligent Follow-up)
                if (textBody !== "start") {
                    // Update: Only stop if sequence allows it
                    const activeDrips = await prisma.dripEnrollment.findMany({
                        where: {
                            contact_id: contact.id,
                            is_stopped: false,
                            // @ts-ignore
                            drip: { stop_on_reply: true }
                        }
                    });

                    if (activeDrips.length > 0) {
                        await prisma.dripEnrollment.updateMany({
                            where: { id: { in: activeDrips.map(d => d.id) } },
                            // @ts-ignore
                            data: { is_stopped: true, stop_reason: "USER_REPLIED" }
                        });
                        console.log(`Stopped ${activeDrips.length} drips for contact ${contact.phone} due to reply.`);
                    }
                }

                if (textBody === "stop" || textBody === "unsubscribe") {
                    await prisma.contact.update({
                        where: { id: contact.id },
                        // @ts-ignore
                        data: { opt_in: false }
                    });
                    // Optional: Send "You have been unsubscribed" via API (outside scope of webhook return)
                    return NextResponse.json({ status: "opted_out" });
                }

                if (textBody === "start" || textBody === "subscribe") {
                    await prisma.contact.update({
                        where: { id: contact.id },
                        // @ts-ignore
                        data: { opt_in: true }
                    });
                }

                // @ts-ignore
                if (!contact.opt_in && textBody !== "start") {
                    // Ignore messages from opted-out users unless they resubscribe
                    return NextResponse.json({ status: "ignored_blocked" });
                }

                // E. Trigger Flow Engine
                const { FlowRunner } = await import("@/lib/engine/flow-runner");

                if (message.text && message.text.body) {
                    await FlowRunner.processMessage(
                        waba.workspace_id,
                        contact.id,
                        message.text.body
                    );
                } else if (message.interactive && message.interactive.type === 'nfm_reply') {
                    // META FLOW RESPONSE
                    const responseJson = message.interactive.nfm_reply.response_json;
                    const data = JSON.parse(responseJson);

                    // Map attributes to Contact
                    await prisma.contact.update({
                        where: { id: contact.id },
                        // @ts-ignore
                        data: {
                            // @ts-ignore
                            attributes: {
                                // @ts-ignore
                                ...(contact.attributes as object || {}),
                                ...data,
                                meta_flow_last_submitted_at: new Date().toISOString()
                            }
                        }
                    });

                    // --- EDU MODULE INTEGRATION ---
                    try {
                        const { EduService } = require("@/lib/edu/service");
                        await EduService.handleMetaFlowSubmission(waba.workspace_id, contact.phone, data);
                    } catch (eduError) {
                        console.error("[Webhook] Edu Meta Flow Error:", eduError);
                    }

                    // Resume Flow
                    await FlowRunner.processMessage(
                        waba.workspace_id,
                        contact.id,
                        "FLOW_SUBMITTED_SUCCESSFULLY"
                    );

                } else if (message.interactive && message.interactive.type === 'list_reply') {
                    // INTERACTIVE LIST RESPONSE
                    const selectedId = message.interactive.list_reply.id;

                    // Trigger Flow with selection
                    await FlowRunner.processMessage(
                        waba.workspace_id,
                        contact.id,
                        `LIST_SELECT_ID:${selectedId}`
                    );
                }
            }
        }

        console.log(`[Webhook] POST processed in ${Date.now() - startTime}ms`);
        return NextResponse.json({ status: "processed" });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
