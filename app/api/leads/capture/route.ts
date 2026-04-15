import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { WhatsAppService } from "../../../../lib/whatsapp/service";
import { decrypt } from "../../../../lib/security/encryption";
import { normalizePhone } from "../../../../lib/utils/phone";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, business_name, whatsapp_number, revenue_range, goal, source } = body;

        if (!whatsapp_number) {
            return NextResponse.json({ error: "WhatsApp number is required" }, { status: 400 });
        }

        const sanitizedPhone = normalizePhone(whatsapp_number);

        // 1. Save Lead to CRM
        const lead = await prisma.lead.create({
            data: {
                name: name || "Tool User",
                email: email || null,
                business_name: business_name || "Self",
                whatsapp_number: sanitizedPhone,
                revenue_range: revenue_range || null,
                goal: goal || "General Inquiry",
                source: source || "Free Tool",
                ip_address: req.headers.get("x-forwarded-for"),
                user_agent: req.headers.get("user-agent")
            }
        });

        // 2. Automate Handshake via Master WABA (Grafty Official)
        // Try to find workspace named 'Grafty' first, fallback to first available WABA
        let masterWaba = await prisma.whatsAppAccount.findFirst({
            where: {
                workspace: {
                    name: { contains: "Grafty", mode: 'insensitive' }
                }
            },
            include: { workspace: true }
        });

        // Fallback: use ANY workspace WABA if no Grafty-named workspace found
        if (!masterWaba) {
            masterWaba = await prisma.whatsAppAccount.findFirst({
                include: { workspace: true }
            });
            if (masterWaba) {
                console.log(`[LeadCapture] No 'Grafty' workspace found. Using fallback WABA from: ${masterWaba.workspace.name}`);
            }
        }

        if (masterWaba && masterWaba.access_token && masterWaba.phone_number_id) {
            try {
                let token = masterWaba.access_token;
                // Graceful Decryption
                if (token.includes(":")) {
                    try {
                        token = decrypt(token);
                    } catch (e) {
                        console.warn("[LeadCapture] Decryption failed, using plain token");
                    }
                }

                const handshakeMessage = `Hi ${name || 'there'}! 👋\n\nThanks for using our *Grafty ${business_name || 'Tool'}*.\n\nReady to see how our Official Business API solutions can scale your specific industry by up to 4x? 📈\n\n👉 *View Industry Blueprints:* https://grafty.pro/solutions\n\nReply "DEMO" if you'd like a personalized walkthrough.`;

                await WhatsAppService.sendText(
                    masterWaba.phone_number_id,
                    token,
                    sanitizedPhone,
                    handshakeMessage,
                    masterWaba.workspace_id,
                    "MARKETING",
                    `Handshake: ${source || goal}`
                );

                console.log(`[LeadCapture] Handshake sent to ${sanitizedPhone} via ${masterWaba.workspace.name}`);
            } catch (waError: any) {
                console.error("[LeadCapture] WhatsApp Handshake Failed:", waError.message);
            }
        }

        // 3. Instant Offer Logic for UI
        let offer = {
            title: "Thank you!",
            description: "We will contact you shortly.",
            cta: "Explore Platform",
            link: "/register"
        };

        if (goal?.includes("abandoned_carts")) {
            offer = {
                title: "🎁 Free Abandoned Cart Template",
                description: "Boost your recovery rate by 25% with our pre-built automation flow.",
                cta: "Claim Now",
                link: "/register?offer=abandoned_cart"
            };
        } else if (goal?.includes("generate_leads")) {
            offer = {
                title: "🔥 High-Converting Lead Capture Flow",
                description: "Download our proven lead gen template for WhatsApp.",
                cta: "Get Template",
                link: "/register?offer=lead_gen"
            };
        } else if (goal?.includes("reseller")) {
            offer = {
                title: "💸 Earn 30% Recurring Commission",
                description: "Start your SaaS business today with our partner dashboard.",
                cta: "Become Reseller",
                link: "/landing/reseller"
            };
        }

        return NextResponse.json({ success: true, leadId: lead.id, offer, handshakeSent: !!masterWaba });
    } catch (error) {
        console.error("Lead Capture Error:", error);
        return NextResponse.json({ error: "Failed to capture lead" }, { status: 500 });
    }
}
