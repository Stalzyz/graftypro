import { prisma } from "../db";
import { WhatsAppService } from "../whatsapp/service";
import { InvoiceService } from "../finance/invoice-service";
import { decrypt } from "../security/encryption";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * ☢️ NUCLEAR PAYMENT ENGINE
 * 
 * End-to-end pipeline: Order → Payment Link → WhatsApp Delivery →
 * Webhook Confirmation → Auto-Invoice → Receipt via WhatsApp.
 * 
 * Supports: Razorpay (primary), PhonePe (secondary)
 */
export class PaymentEngine {

    // =========================================================
    // 1. CREATE & SEND PAYMENT LINK
    // =========================================================

    /**
     * Generate a payment link for an order and send it to the customer via WhatsApp.
     * Auto-detects payment gateway: Razorpay (primary) → PhonePe (fallback).
     */
    static async createAndSendPaymentLink(orderId: string): Promise<{
        paymentUrl: string;
        gateway: string;
        messageSent: boolean;
    }> {
        // 1. Load order with full context
        const order = await prisma.commerceOrder.findUnique({
            where: { id: orderId },
            include: {
                items: true,
                contact: true,
                store: {
                    include: { workspace: { include: { waba: true } } }
                }
            }
        });

        if (!order) throw new Error(`Order ${orderId} not found`);
        if (order.payment_status === "PAID") throw new Error(`Order ${order.order_number} is already paid`);
        if (!order.store.workspace?.waba) throw new Error("WhatsApp account not connected for this workspace");

        const workspaceId = order.store.workspace_id;
        const contact = order.contact;
        const totalAmount = Number(order.total_amount);
        const waba = order.store.workspace.waba;

        // 2. Detect active payment gateway
        const { gateway, paymentUrl, paymentId } = await this.generatePaymentLink(
            workspaceId,
            orderId,
            totalAmount,
            order.store.currency || "INR",
            `Order #${order.order_number}`,
            {
                name: contact.name || "Customer",
                contact: contact.phone,
                email: (contact as any).email || ""
            }
        );

        // 3. Update order with payment reference
        await prisma.commerceOrder.update({
            where: { id: orderId },
            data: {
                payment_method: gateway,
                metadata: {
                    ...(order.metadata as any || {}),
                    payment_link_url: paymentUrl,
                    payment_link_id: paymentId,
                    payment_link_created_at: new Date().toISOString()
                }
            }
        });

        // 4. Send payment link to customer via WhatsApp CTA Button
        let messageSent = false;
        try {
            const token = decrypt(waba.access_token);
            const itemsSummary = order.items
                .slice(0, 5) // Show max 5 items
                .map(item => `• ${item.name} x${item.quantity} — ₹${Number(item.total).toLocaleString("en-IN")}`)
                .join("\n");

            const moreItems = order.items.length > 5 ? `\n  _...and ${order.items.length - 5} more items_` : "";

            const body = [
                `🧾 *Order #${order.order_number}*`,
                "",
                itemsSummary,
                moreItems,
                "",
                `━━━━━━━━━━━━━━━━━`,
                `💰 *Total: ₹${totalAmount.toLocaleString("en-IN")}*`,
                "",
                `Tap the button below to complete your payment securely.`
            ].filter(Boolean).join("\n");

            await WhatsAppService.sendURLButton(
                waba.phone_number_id,
                token,
                contact.phone,
                body,
                "Pay Now 💳",
                paymentUrl,
                undefined,
                workspaceId,
                "UTILITY",
                `Payment Link for ${order.order_number}`
            );

            messageSent = true;
            console.log(`[PaymentEngine] ✅ Payment link sent to ${contact.phone} for ${order.order_number}`);
        } catch (err: any) {
            console.error(`[PaymentEngine] ⚠️ Failed to send payment link via WhatsApp:`, err.message);
            // Payment link is still valid — customer can pay via other delivery methods
        }

        return { paymentUrl, gateway, messageSent };
    }

    /**
     * Generate a payment link using the best available gateway.
     * Priority: Razorpay → PhonePe
     */
    private static async generatePaymentLink(
        workspaceId: string,
        orderId: string,
        amount: number,
        currency: string,
        description: string,
        customer: { name: string; contact: string; email: string }
    ): Promise<{ gateway: string; paymentUrl: string; paymentId: string }> {

        // Try Razorpay first
        try {
            const { RazorpayManager } = await import("@/lib/payments/razorpay");
            const link = await RazorpayManager.createPaymentLink(
                workspaceId,
                amount,
                currency,
                description,
                customer,
                { orderId, source: "COMMERCE_ENGINE" }
            );

            const linkResult = link as any;
            return {
                gateway: "RAZORPAY",
                paymentUrl: linkResult.short_url || linkResult.url || linkResult.payment_url,
                paymentId: linkResult.id
            };
        } catch (rzpError: any) {
            console.warn(`[PaymentEngine] Razorpay unavailable: ${rzpError.message}`);
        }

        // Try PhonePe
        try {
            const { PhonePeManager } = await import("@/lib/payments/phonepe");
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.grafty.in";
            const txnId = `ORD_${orderId.substring(0, 8)}_${Date.now()}`;

            const result = await PhonePeManager.createPaymentLinkForWorkspace(
                workspaceId,
                amount,
                txnId,
                customer.contact,
                `${appUrl}/api/payments/webhook`,
                `${appUrl}/payment/success?order=${orderId}`,
                customer.contact
            );

            return {
                gateway: "PHONEPE",
                paymentUrl: result.redirectUrl,
                paymentId: result.transactionId
            };
        } catch (ppError: any) {
            console.warn(`[PaymentEngine] PhonePe unavailable: ${ppError.message}`);
        }

        throw new Error("No payment gateway configured. Please set up Razorpay or PhonePe in Integrations.");
    }

    // =========================================================
    // 2. HANDLE PAYMENT SUCCESS — Webhook callback
    // =========================================================

    /**
     * Process a successful payment: update order status, generate invoice, send receipt.
     * Called from the payment webhook handler.
     */
    static async handlePaymentSuccess(
        paymentId: string,
        gateway: string,
        amount: number,
        metadata?: any
    ): Promise<{ orderId: string; invoiceNumber: string }> {

        // 1. Find the order linked to this payment
        const orderId = metadata?.orderId || metadata?.notes?.orderId;
        if (!orderId) {
            console.warn(`[PaymentEngine] Payment ${paymentId} has no orderId in metadata`);
            throw new Error("Payment cannot be linked to an order");
        }

        const order = await prisma.commerceOrder.findUnique({
            where: { id: orderId },
            include: {
                items: true,
                contact: true,
                store: {
                    include: { workspace: { include: { waba: true } } }
                }
            }
        });

        if (!order) throw new Error(`Order ${orderId} not found`);

        // Idempotency: skip if already paid
        if (order.payment_status === "PAID") {
            console.log(`[PaymentEngine] Order ${order.order_number} already marked PAID. Skipping.`);
            return { orderId: order.id, invoiceNumber: "ALREADY_PROCESSED" };
        }

        // 2. Atomically update order status
        await prisma.commerceOrder.update({
            where: { id: order.id },
            data: {
                payment_status: "PAID",
                status: "PAID",
                payment_method: gateway,
                metadata: {
                    ...(order.metadata as any || {}),
                    payment_confirmed_id: paymentId,
                    payment_confirmed_at: new Date().toISOString(),
                    payment_confirmed_amount: amount
                }
            }
        });

        console.log(`[PaymentEngine] ✅ Order ${order.order_number} marked PAID (${gateway}: ${paymentId})`);

        // 3. Auto-generate GST invoice
        let invoiceNumber = "PENDING";
        try {
            const invoice = await this.generateOrderInvoice(order);
            invoiceNumber = invoice.invoice_number;
            console.log(`[PaymentEngine] 🧾 Invoice generated: ${invoiceNumber}`);
        } catch (invErr: any) {
            console.error(`[PaymentEngine] ⚠️ Invoice generation failed:`, invErr.message);
            // Non-blocking: order is still confirmed
        }

        // 4. Deduct stock
        try {
            for (const item of order.items) {
                if (item.product_id) {
                    await prisma.commerceProduct.update({
                        where: { id: item.product_id },
                        data: { stock: { decrement: item.quantity } }
                    });
                }
            }
        } catch (stockErr: any) {
            console.error(`[PaymentEngine] ⚠️ Stock deduction failed:`, stockErr.message);
        }

        // 5. Send payment confirmation + receipt via WhatsApp
        try {
            await this.sendPaymentReceipt(order, invoiceNumber);
        } catch (receiptErr: any) {
            console.error(`[PaymentEngine] ⚠️ Receipt delivery failed:`, receiptErr.message);
        }

        return { orderId: order.id, invoiceNumber };
    }

    // =========================================================
    // 3. AUTO-INVOICE GENERATION
    // =========================================================

    /**
     * Generate a GST-compliant invoice from a confirmed order.
     */
    static async generateOrderInvoice(order: any): Promise<any> {
        const store = order.store || await prisma.commerceStore.findUnique({
            where: { id: order.store_id }
        });

        const workspaceId = store.workspace_id;

        // Build invoice items from order items
        const invoiceItems = order.items.map((item: any) => ({
            description: item.name,
            hsn_code: "998311", // Default SaaS/Digital Services HSN
            quantity: item.quantity,
            rate: Number(item.price),
            taxable_value: Number(item.price) * item.quantity
        }));

        // Build billing details from order's shipping address or contact
        const shippingAddr = order.shipping_address as any || {};
        const contact = order.contact;

        const billingDetails = {
            name: shippingAddr.name || contact?.name || "Customer",
            address: [
                shippingAddr.address,
                shippingAddr.city,
                shippingAddr.state,
                shippingAddr.pincode
            ].filter(Boolean).join(", ") || "Not Provided",
            state: shippingAddr.state || store.business_state || "Karnataka",
            pincode: shippingAddr.pincode || "",
            gstin: order.customer_gstin || shippingAddr.gstin,
            email: shippingAddr.email || (contact as any)?.email,
            phone: contact?.phone
        };

        // Create the invoice using the existing InvoiceService
        const invoice = await InvoiceService.createInvoice({
            workspaceId,
            items: invoiceItems,
            billingDetails,
            paymentId: order.id,
            paymentMethod: order.payment_method || "ONLINE",
            status: "PAID"
        });

        return invoice;
    }

    // =========================================================
    // 4. SEND PAYMENT RECEIPT VIA WHATSAPP
    // =========================================================

    /**
     * Send a payment confirmation message with invoice link to the customer.
     */
    private static async sendPaymentReceipt(order: any, invoiceNumber: string): Promise<void> {
        const waba = order.store?.workspace?.waba;
        if (!waba) {
            console.warn(`[PaymentEngine] No WABA for receipt delivery`);
            return;
        }

        const token = decrypt(waba.access_token);
        const contact = order.contact;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://app.grafty.in";
        const invoiceUrl = `${appUrl}/api/invoices/${encodeURIComponent(invoiceNumber)}/download`;

        const totalFormatted = Number(order.total_amount).toLocaleString("en-IN");

        const receiptBody = [
            `✅ *Payment Confirmed!*`,
            "",
            `🧾 Order: *#${order.order_number}*`,
            `💰 Amount: *₹${totalFormatted}*`,
            `📋 Invoice: *${invoiceNumber}*`,
            "",
            `Thank you for your purchase! 🎉`,
            `Your invoice is ready for download.`
        ].join("\n");

        // Send CTA button with invoice download link
        await WhatsAppService.sendURLButton(
            waba.phone_number_id,
            token,
            contact.phone,
            receiptBody,
            "Download Invoice 🧾",
            invoiceUrl,
            undefined,
            order.store.workspace_id,
            "UTILITY",
            `Receipt for ${order.order_number}`
        );

        console.log(`[PaymentEngine] 📨 Receipt sent to ${contact.phone} for ${order.order_number}`);
    }

    // =========================================================
    // 5. HANDLE PAYMENT FAILURE
    // =========================================================

    /**
     * Notify customer of payment failure and offer retry.
     */
    static async handlePaymentFailure(
        orderId: string,
        reason?: string
    ): Promise<void> {
        const order = await prisma.commerceOrder.findUnique({
            where: { id: orderId },
            include: {
                contact: true,
                store: {
                    include: { workspace: { include: { waba: true } } }
                }
            }
        });

        if (!order || !order.store.workspace?.waba) return;

        // Update order status
        await prisma.commerceOrder.update({
            where: { id: order.id },
            data: {
                payment_status: "FAILED",
                metadata: {
                    ...(order.metadata as any || {}),
                    payment_failure_reason: reason,
                    payment_failed_at: new Date().toISOString()
                }
            }
        });

        // Send failure notification
        const waba = order.store.workspace.waba;
        const token = decrypt(waba.access_token);

        const failureBody = [
            `⚠️ *Payment Issue*`,
            "",
            `We noticed your payment for *Order #${order.order_number}* (₹${Number(order.total_amount).toLocaleString("en-IN")}) didn't go through.`,
            "",
            reason ? `Reason: ${reason}` : "",
            "",
            `Don't worry — your order is saved. Tap below to try again.`
        ].filter(Boolean).join("\n");

        try {
            await WhatsAppService.sendInteractiveButtons(
                waba.phone_number_id,
                token,
                order.contact.phone,
                failureBody,
                [
                    { id: `retry_pay_${order.id}`, title: "Retry Payment" },
                    { id: `cancel_order_${order.id}`, title: "Cancel Order" }
                ],
                undefined,
                order.store.workspace_id,
                "UTILITY",
                "Payment failure notification"
            );
        } catch (err: any) {
            console.error(`[PaymentEngine] Failure notification delivery failed:`, err.message);
        }
    }
}
