import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { FlowRunner } from "@/lib/engine/flow-runner";
import { buildTextPayload } from "@/lib/engine/payload-builder";
import { WhatsAppService } from "@/lib/whatsapp/service";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const apiKey = req.headers.get("Authorization")?.replace("Bearer ", "") || body.api_key;

        if (!apiKey) {
            return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
        }

        // Validate Key
        const workspace = await prisma.workspace.findUnique({
            where: { api_key: apiKey },
            include: { waba: true }
        });

        if (!workspace) {
            return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
        }

        const waba = workspace.waba;
        if (!waba || waba.status !== "CONNECTED") {
            return NextResponse.json({ error: "WhatsApp Account not connected" }, { status: 400 });
        }

        const { action, phone, flow_id, template_name, parameters } = body;

        if (!phone) {
            return NextResponse.json({ error: "Missing destination 'phone'" }, { status: 400 });
        }

        // Clean phone
        const cleanPhone = phone.replace(/[^0-9]/g, "");

        // 1. Action: Trigger a Flow
        if (action === "trigger_flow" && flow_id) {
            const flow = await prisma.flow.findFirst({
                where: { id: flow_id, workspace_id: workspace.id, status: "PUBLISHED" }
            });

            if (!flow) {
                return NextResponse.json({ error: "Flow not found or not published" }, { status: 404 });
            }

            // Find or create Contact
            let contact = await prisma.contact.findFirst({
                where: { workspace_id: workspace.id, phone: cleanPhone }
            });

            if (!contact) {
                contact = await prisma.contact.create({
                    data: {
                        workspace_id: workspace.id,
                        phone: cleanPhone,
                        name: cleanPhone,
                        opt_in: true
                    }
                });
            }

            console.log(`[API Trigger] Triggering flow ${flow.id} for ${cleanPhone}`);
            await FlowRunner.startFlow(workspace.id, contact.id, flow.id, parameters || {});

            return NextResponse.json({ success: true, message: "Flow triggered successfully" });
        }

        // 2. Action: Send Template
        if (action === "send_template" && template_name) {
            const components = Array.isArray(parameters)
                ? [{
                    type: "body",
                    parameters: parameters.map((val: any) => ({
                        type: "text",
                        text: String(val)
                    }))
                }]
                : [];

            await WhatsAppService.sendTemplate(
                waba.phone_number_id,
                waba.access_token,
                cleanPhone,
                template_name,
                body.language || "en",
                components
            );

            return NextResponse.json({ success: true, message: "Template sent successfully" });
        }

        // 3. Action: Send Message
        if (action === "send_message" && (parameters?.text || body.text)) {
            const text = parameters?.text || body.text;
            await WhatsAppService.sendText(
                waba.phone_number_id,
                waba.access_token,
                cleanPhone,
                text
            );

            return NextResponse.json({ success: true, message: "Message sent successfully" });
        }

        return NextResponse.json({ error: "Invalid action or missing parameters" }, { status: 400 });

    } catch (error: any) {
        console.error("POST /api/v1/trigger error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
