
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { FlowRunner } from "../../../../lib/engine/flow-runner";

export const dynamic = "force-dynamic";

/**
 * Handle Razorpay Webhooks
 * This triggers flow transitions when a payment is successful.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const event = body.event;

        console.log(`💳 Payment Webhook: ${event}`);

        if (event === 'payment_link.paid') {
            const paymentLink = body.payload.payment_link.entity;
            const contactPhone = paymentLink.customer.contact;
            const amount = paymentLink.amount / 100; // Razorpay sends in paise

            // Find contact
            const contact = await prisma.contact.findFirst({
                where: { phone: contactPhone }
            });

            if (contact) {
                // Find active flow session for this contact that is at a 'payment' node
                const session = await prisma.flowSession.findFirst({
                    where: {
                        contact_id: contact.id,
                        is_completed: false
                    },
                    include: { flow: true }
                });

                if (session) {
                    console.log(`🚀 Advancing Flow Session ${session.id} after payment`);

                    // Trigger FlowRunner to move to next node
                    await FlowRunner.processMessage(
                        contact.workspace_id,
                        contact.id,
                        "PAYMENT_SUCCESSFUL_INTERNAL_TRIGGER"
                    );
                }
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (error: any) {
        console.error("Payment Webhook Error:", error);
        return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
}
