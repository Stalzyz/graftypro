import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, business_name, whatsapp_number, revenue_range, goal } = body;

        const lead = await prisma.lead.create({
            data: {
                name,
                business_name,
                whatsapp_number,
                revenue_range,
                goal,
                ip_address: req.headers.get("x-forwarded-for"),
                user_agent: req.headers.get("user-agent")
            }
        });

        // Instant Offer Logic based on Selection
        let offer = {
            title: "Thank you!",
            description: "We will contact you shortly.",
            cta: "Explre Platform",
            link: "/register"
        };

        if (goal === "recover_abandoned_carts") {
            offer = {
                title: "🎁 Free Abandoned Cart Template",
                description: "Boost your recovery rate by 25% with our pre-built automation flow.",
                cta: "Claim Now",
                link: "/register?offer=abandoned_cart"
            };
        } else if (goal === "generate_leads") {
            offer = {
                title: "🔥 High-Converting Lead Capture Flow",
                description: "Download our proven lead gen template for WhatsApp.",
                cta: "Get Template",
                link: "/register?offer=lead_gen"
            };
        } else if (goal === "become_reseller") {
            offer = {
                title: "💸 Earn 30% Recurring Commission",
                description: "Start your SaaS business today with our partner dashboard.",
                cta: "Become Reseller",
                link: "/landing/reseller"
            };
        } else if (goal === "launch_white_label") {
            offer = {
                title: "🏢 Own Your WhatsApp Platform",
                description: "Full white-label control over pricing and clients.",
                cta: "View Enterprise",
                link: "/landing/white-label"
            };
        }

        return NextResponse.json({ success: true, leadId: lead.id, offer });
    } catch (error) {
        console.error("Lead Capture Error:", error);
        return NextResponse.json({ error: "Failed to capture lead" }, { status: 500 });
    }
}
