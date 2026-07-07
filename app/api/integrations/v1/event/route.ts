import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

/**
 * 👹 GRAFTY INBOUND API (V1)
 * Purpose: Receives events from external CMS/E-commerce platforms.
 * Auth: Bearer <API_KEY>
 */

export async function POST(req: NextRequest) {
    try {
        const headerList = headers();
        const authHeader = headerList.get("authorization");

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ success: false, error: "Missing or invalid Authorization header" }, { status: 401 });
        }

        const apiKey = authHeader.replace("Bearer ", "").trim();

        // 1. Verify API Key
        const workspace = await prisma.workspace.findUnique({
            where: { api_key: apiKey },
            include: { waba: true }
        });

        if (!workspace) {
            return NextResponse.json({ success: false, error: "Invalid API Key" }, { status: 403 });
        }

        const body = await req.json();
        const { event, payload } = body;

        if (!event || !payload || !payload.phone) {
            return NextResponse.json({ success: false, error: "Invalid payload. 'event' and 'payload.phone' are required." }, { status: 400 });
        }

        console.log(`[InboundAPI] 🚀 Event '${event}' received for Workspace: ${workspace.name}`);

        // 2. Clean Phone Number
        let cleanPhone = payload.phone.replace(/\D/g, "");
        if (!cleanPhone.startsWith("+")) cleanPhone = `+${cleanPhone}`;

        // 3. Upsert Contact
        const contact = await prisma.contact.upsert({
            where: {
                workspace_id_phone: {
                    workspace_id: workspace.id,
                    phone: cleanPhone
                }
            },
            create: {
                workspace_id: workspace.id,
                phone: cleanPhone,
                name: payload.name || "External User",
                email: payload.email || null,
                source: "API",
                tags: ["api-inbound", `event:${event}`],
                attributes: payload.attributes || {}
            },
            update: {
                name: payload.name || undefined,
                email: payload.email || undefined,
                tags: {
                    set: Array.from(new Set([...(payload.tags || []), "api-inbound", `event:${event}`]))
                },
                attributes: {
                    ...(payload.attributes || {}),
                    last_event: event,
                    last_event_at: new Date().toISOString()
                }
            }
        });

        // 4. Trigger Auto-Response / Flow (Optional Integration)
        // If the workspace has a flow mapped to this event, we could enqueue it here.
        // For now, we'll just acknowledge receipt.

        return NextResponse.json({
            success: true,
            message: `Event '${event}' processed successfully`,
            contactId: contact.id
        });

    } catch (error: any) {
        console.error(`[InboundAPI] ❌ Error:`, error.message);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
