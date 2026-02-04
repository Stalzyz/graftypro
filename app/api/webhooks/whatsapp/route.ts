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
    try {
        const body = await req.json();

        // 1. Immediate 200 OK (Important for Meta)
        // We strictly should process async, but for MVP we do simplified logic here.
        // Ideally: Push 'body' to Redis Queue -> Return 200 -> Worker processes it.

        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;

        if (!value) return NextResponse.json({ status: "ignored" });

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
                const conversation = await prisma.conversation.findFirst({
                    where: {
                        contact_id: contact.id,
                        status: "OPEN",
                    },
                });

                if (!conversation) {
                    await prisma.conversation.create({
                        data: {
                            workspace_id: waba.workspace_id,
                            contact_id: contact.id,
                            status: "OPEN"
                        }
                    })
                }

                // E. Trigger Flow Engine
                // We import dynamically to avoid circular dependencies if any, or just standard import at top.
                const { FlowRunner } = await import("@/lib/engine/flow-runner");

                if (message.text && message.text.body) {
                    await FlowRunner.processMessage(
                        waba.workspace_id,
                        contact.id,
                        message.text.body
                    );
                }
            }
        }

        return NextResponse.json({ status: "processed" });

    } catch (error) {
        console.error("Webhook Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
