import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { WhatsAppService } from "@/lib/whatsapp/service";

/**
 * 🔐 GRAFTY DIRECT WHATSAPP API (V1 - Multi-Tenant)
 * Purpose: Allows any external platform (Raaghas, Shopify, Custom CMS) to dispatch WhatsApp templates.
 * Auth: Bearer <Workspace API Key>
 * 
 * Features:
 * - Multi-vendor isolation (uses vendor's own WABA credentials)
 * - Automatic Credit Deduction (via WhatsAppService)
 * - Meta Graph API v21.0 compliance
 * - Smart Retry & Logging
 */
export async function POST(req: Request) {
    try {
        const authHeader = req.headers.get("authorization");
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json({ error: "Unauthorized: Missing API Key" }, { status: 401 });
        }

        const apiKey = authHeader.replace("Bearer ", "").trim();

        // 1. Authenticate Workspace & Fetch Vendor's own WhatsApp Credentials
        const workspace = await prisma.workspace.findUnique({
            where: { api_key: apiKey },
            include: { waba: true }
        });

        if (!workspace) {
            console.warn(`[GraftyAPI] 🛑 Invalid API Key attempt.`);
            return NextResponse.json({ error: "Invalid API Key" }, { status: 401 });
        }

        const waba = workspace.waba;
        if (!waba || !waba.access_token || !waba.phone_number_id) {
            return NextResponse.json({ 
                error: "WhatsApp account not connected", 
                details: "The vendor must connect their WhatsApp Business Account in the Grafty dashboard before using the API." 
            }, { status: 400 });
        }

        if (waba.status !== "CONNECTED") {
            return NextResponse.json({ error: "WhatsApp account is disconnected or restricted" }, { status: 403 });
        }

        const body = await req.json();
        const { recipient, template } = body;

        // Basic Validation
        if (!recipient?.phone || !template?.name) {
            return NextResponse.json({ error: "Missing recipient.phone or template.name in payload" }, { status: 400 });
        }

        // 2. Build Meta-Compliant Components Payload
        // We transform the simplified 'variables' structure into Meta's strict component array
        const components: any[] = [];

        // Body parameters
        if (template.variables?.body && Array.isArray(template.variables.body)) {
            components.push({
                type: "body",
                parameters: template.variables.body.map((text: any) => ({
                    type: "text",
                    text: String(text)
                }))
            });
        }

        // Button parameters (typically used for dynamic URL suffixes)
        if (template.variables?.buttons && Array.isArray(template.variables.buttons) && template.variables.buttons.length > 0) {
            components.push({
                type: "button",
                sub_type: "url",
                index: "0",
                parameters: [{
                    type: "text",
                    text: String(template.variables.buttons[0])
                }]
            });
        }

        console.log(`[GraftyAPI] 🚀 Dispatching template '${template.name}' for Workspace: ${workspace.name} (${workspace.id})`);

        // 3. Dispatch via Internal Service
        // This ensures: 
        // - Credits are deducted from the vendor's wallet
        // - Retries are handled automatically
        // - Messages are logged in Grafty's message history
        const response = await WhatsAppService.sendTemplate(
            waba.phone_number_id,
            waba.access_token,
            recipient.phone,
            template.name,
            template.language || "en",
            components,
            workspace.id,
            "UTILITY", // transactional nudge
            `API Integration: ${template.name}`
        );

        // 4. Success! Return the Meta Message ID
        return NextResponse.json({
            success: true,
            messageId: response.messages?.[0]?.id || "queued",
            status: "accepted"
        });

    } catch (error: any) {
        console.error("[GraftyAPI] Critical Error:", error.message);
        
        // Handle Meta API specific errors gracefully
        const metaError = error.response?.data?.error;
        if (metaError) {
            return NextResponse.json({ 
                error: "WhatsApp API Rejection", 
                details: metaError.message || metaError 
            }, { status: 400 });
        }

        return NextResponse.json({ 
            error: error.message || "Internal Server Error" 
        }, { status: 500 });
    }
}
