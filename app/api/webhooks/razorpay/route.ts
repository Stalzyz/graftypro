
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const payload = JSON.parse(body);
        const event = payload.event;

        if (event === "payment_link.paid") {
            const paymentLink = payload.payload.payment_link.entity;
            const workspaceId = paymentLink.notes?.workspaceId;
            const phone = paymentLink.customer.contact;

            // Normalize phone (strip +)
            const cleanPhone = phone.replace('+', '');

            console.log(`💰 Payment Received from ${cleanPhone} for Workspace ${workspaceId}`);

            // 1. Find Contact
            const contact = await prisma.contact.findFirst({
                where: {
                    workspace_id: workspaceId,
                    phone: cleanPhone
                }
            });

            if (contact) {
                // 2. Update Tags
                const currentTags = contact.tags || [];
                if (!currentTags.includes("Paid_Customer")) {
                    await prisma.contact.update({
                        where: { id: contact.id },
                        data: {
                            tags: [...currentTags, "Paid_Customer"]
                        }
                    });
                }

                // 3. Re-trigger Flow Engine
                const { FlowRunner } = await import("@/lib/engine/flow-runner");
                await FlowRunner.processMessage(workspaceId, contact.id, "PAYMENT_SUCCESSFUL_INTERNAL_TRIGGER");
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("Razorpay Webhook Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
