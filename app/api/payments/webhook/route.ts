
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { FlowRunner } from "../../../../lib/engine/flow-runner";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * ☢️ NUCLEAR PAYMENT WEBHOOK HANDLER
 * 
 * Processes payment callbacks from Razorpay and PhonePe.
 * On success: Updates order → generates invoice → sends receipt via WhatsApp.
 * On failure: Notifies customer with retry button.
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const event = body.event;

        console.log(`💳 [PaymentWebhook] Event received: ${event || "UNKNOWN"}`);

        // ============================
        // RAZORPAY WEBHOOKS
        // ============================
        if (event && event.startsWith("payment_link")) {
            return await handleRazorpayEvent(event, body);
        }

        // Standard Razorpay payment.captured event
        if (event === "payment.captured") {
            return await handleRazorpayPaymentCaptured(body);
        }

        // ============================
        // PHONEPE CALLBACKS
        // ============================
        if (body.code || body.merchantTransactionId) {
            return await handlePhonePeCallback(body);
        }

        // ============================
        // LEGACY: Flow-based payment trigger
        // ============================
        if (event === 'payment_link.paid') {
            return await handleLegacyFlowPayment(body);
        }

        console.log(`[PaymentWebhook] ℹ️ Unhandled event type: ${event}`);
        return NextResponse.json({ status: "ignored" });
    } catch (error: any) {
        console.error("[PaymentWebhook] ❌ Critical Error:", error.message);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}

/**
 * Handle Razorpay payment_link events (paid / expired / cancelled)
 */
async function handleRazorpayEvent(event: string, body: any) {
    const { PaymentEngine } = await import("@/lib/commerce/payment-engine");

    if (event === "payment_link.paid") {
        const paymentLink = body.payload?.payment_link?.entity;
        if (!paymentLink) {
            console.warn("[PaymentWebhook] Razorpay event missing payment_link entity");
            return NextResponse.json({ status: "invalid_payload" }, { status: 400 });
        }

        const paymentId = paymentLink.id;
        const amount = (paymentLink.amount || 0) / 100; // Convert paise to rupees
        const notes = paymentLink.notes || {};

        try {
            const result = await PaymentEngine.handlePaymentSuccess(
                paymentId,
                "RAZORPAY",
                amount,
                { orderId: notes.orderId, notes }
            );

            console.log(`[PaymentWebhook] ✅ Razorpay Success: Order=${result.orderId}, Invoice=${result.invoiceNumber}`);

            // Also trigger flow advancement if applicable
            await advanceFlowIfActive(paymentLink.customer?.contact, paymentLink.notes?.workspaceId);

            return NextResponse.json({ status: "ok", ...result });
        } catch (err: any) {
            console.error(`[PaymentWebhook] Razorpay payment processing failed:`, err.message);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
    }

    if (event === "payment_link.expired" || event === "payment_link.cancelled") {
        const paymentLink = body.payload?.payment_link?.entity;
        const orderId = paymentLink?.notes?.orderId;
        if (orderId) {
            await PaymentEngine.handlePaymentFailure(orderId, `Payment link ${event.replace("payment_link.", "")}`);
        }
        return NextResponse.json({ status: "handled" });
    }

    return NextResponse.json({ status: "ignored" });
}

/**
 * Handle Razorpay payment.captured event (direct payment, not link)
 */
async function handleRazorpayPaymentCaptured(body: any) {
    const payment = body.payload?.payment?.entity;
    if (!payment) return NextResponse.json({ status: "invalid_payload" }, { status: 400 });

    const { PaymentEngine } = await import("@/lib/commerce/payment-engine");
    const notes = payment.notes || {};
    const orderId = notes.orderId;

    if (!orderId) {
        console.log("[PaymentWebhook] payment.captured without orderId — legacy flow");
        return NextResponse.json({ status: "no_order" });
    }

    try {
        const result = await PaymentEngine.handlePaymentSuccess(
            payment.id,
            "RAZORPAY",
            (payment.amount || 0) / 100,
            { orderId, notes }
        );

        return NextResponse.json({ status: "ok", ...result });
    } catch (err: any) {
        console.error(`[PaymentWebhook] payment.captured processing failed:`, err.message);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

/**
 * Handle PhonePe callback
 */
async function handlePhonePeCallback(body: any) {
    const { PaymentEngine } = await import("@/lib/commerce/payment-engine");

    const isSuccess = body.code === "PAYMENT_SUCCESS" || body.success === true;
    const txnId = body.merchantTransactionId || body.data?.merchantTransactionId;
    const amount = body.data?.amount ? body.data.amount / 100 : 0;

    // Extract orderId from transaction ID (format: ORD_{orderId}_timestamp)
    let orderId: string | null = null;
    if (txnId && txnId.startsWith("ORD_")) {
        const parts = txnId.split("_");
        if (parts.length >= 2) {
            // Try to find order by partial match
            const partialId = parts[1];
            const order = await prisma.commerceOrder.findFirst({
                where: { id: { startsWith: partialId } }
            });
            if (order) orderId = order.id;
        }
    }

    if (!orderId) {
        console.warn(`[PaymentWebhook] PhonePe callback: cannot resolve order from txnId=${txnId}`);
        return NextResponse.json({ status: "order_not_found" }, { status: 404 });
    }

    if (isSuccess) {
        try {
            const result = await PaymentEngine.handlePaymentSuccess(
                txnId,
                "PHONEPE",
                amount,
                { orderId }
            );

            console.log(`[PaymentWebhook] ✅ PhonePe Success: Order=${result.orderId}, Invoice=${result.invoiceNumber}`);
            return NextResponse.json({ status: "ok", ...result });
        } catch (err: any) {
            console.error(`[PaymentWebhook] PhonePe processing failed:`, err.message);
            return NextResponse.json({ error: err.message }, { status: 500 });
        }
    } else {
        await PaymentEngine.handlePaymentFailure(orderId, body.code || "Payment failed");
        return NextResponse.json({ status: "failure_handled" });
    }
}

/**
 * Legacy: Advance WhatsApp Flow if contact has an active flow session at a payment node.
 */
async function advanceFlowIfActive(phone?: string, workspaceId?: string) {
    if (!phone) return;

    try {
        const contact = await prisma.contact.findFirst({
            where: { phone }
        });

        if (contact) {
            const session = await prisma.flowSession.findFirst({
                where: { contact_id: contact.id, is_completed: false }
            });

            if (session) {
                console.log(`[PaymentWebhook] 🚀 Advancing Flow Session ${session.id} after payment`);
                await FlowRunner.processMessage(
                    contact.workspace_id,
                    contact.id,
                    "PAYMENT_SUCCESSFUL_INTERNAL_TRIGGER" as any
                );
            }
        }
    } catch (err: any) {
        console.error(`[PaymentWebhook] Flow advancement failed:`, err.message);
    }
}

/**
 * Legacy handler for backward compatibility
 */
async function handleLegacyFlowPayment(body: any) {
    const paymentLink = body.payload?.payment_link?.entity;
    if (!paymentLink) return NextResponse.json({ status: "ok" });

    await advanceFlowIfActive(paymentLink.customer?.contact);
    return NextResponse.json({ status: "ok" });
}
