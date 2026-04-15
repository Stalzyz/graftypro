import { NextResponse } from "next/server";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

import { prisma } from "../../../../../lib/db";

export async function POST(req: Request) {
    try {
        const text = await req.text();
        const signature = req.headers.get("x-razorpay-signature");
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

        // 1. Verify Signature
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(text)
            .digest("hex");

        if (expectedSignature !== signature) {
            return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
        }

        const event = JSON.parse(text);
        const { payload } = event;

        if (event.event === "payment.captured") {
            const payment = payload.payment.entity;
            const order_id = payment.order_id;
            const amount = payment.amount / 100; // Convert back to main unit
            const notes = payment.notes;
            const workspace_id = notes.workspace_id;

            console.log(`💰 Payment Captured: ${amount} for Workspace ${workspace_id}`);

            // 2. Database Update Transaction (Atomically)
            await prisma.$transaction(async (tx) => {
                // A. Update Transaction Status
                // @ts-ignore
                const transaction = await tx.transaction.findFirst({
                    where: { reference_id: order_id }
                });

                if (transaction) {
                    // @ts-ignore
                    await tx.transaction.update({
                        where: { id: transaction.id },
                        data: { status: "SUCCESS" }
                    });
                } else {
                    // Fallback if transaction wasn't created in order step (rare)
                    // @ts-ignore
                    await tx.transaction.create({
                        data: {
                            workspace_id,
                            amount,
                            currency: payment.currency,
                            type: "CREDIT_PURCHASE",
                            status: "SUCCESS",
                            reference_id: payment.id,
                            description: "Direct Webhook Capture"
                        }
                    });
                }

                // B. Credit Wallet (Enterprise Credit System - Phase 2)
                const { CreditService } = require("@/lib/credits/service");
                await CreditService.addCredits(
                    tx,
                    workspace_id,
                    amount,
                    payment.id,
                    `Credit Purchase: ${payment.id}`
                );

                // C. Create Invoice
                const invoiceNum = `INV-${Date.now()}`;
                // @ts-ignore
                await tx.invoice.create({
                    data: {
                        workspace_id,
                        invoice_number: invoiceNum,
                        total_amount: amount,
                        net_amount: amount / 1.18, // Assume inclusive GST
                        gst_amount: amount - (amount / 1.18),
                        status: "PAID",
                        billing_name: workspace_id, // Fallback
                        billing_address: "Address Not Provided",
                        billing_state: "India", // Fallback
                        billing_pincode: "000000" // Fallback
                    }
                });

                // --- PHASE 3 & 5: RESELLER COMMISSION ---
                try {
                    const { ResellerService } = require("@/lib/reseller/service");
                    await ResellerService.processPaymentCommission(tx, workspace_id, amount, payment.id);
                } catch (resellerError) {
                    console.error("Reseller Commission Error:", resellerError);
                    // We don't fail the payment if commission fails, but we log it.
                }
            });

            return NextResponse.json({ status: "ok" });
        }

        if (event.event === "payment_link.paid") {
            const link = payload.payment_link.entity;
            const payment = payload.payment?.entity; // Note: payment might be in payload.payment
            const notes = link.notes;
            const workspace_id = notes.workspace_id;
            const eduLeadId = notes.eduLeadId;

            // --- Case A: Smart Topup ---
            if (notes.source === "SMART_TOPUP" && workspace_id) {
                const amount = Number(notes.topup_amount);
                console.log(`[Webhook] ⚡ Processing Smart Topup for ${workspace_id} (₹${amount})`);

                await prisma.$transaction(async (tx) => {
                    const { CreditService } = require("@/lib/credits/service");
                    const { InvoiceService } = require("@/lib/finance/invoice-service");

                    // 1. Credit Wallet
                    await CreditService.addCredits(
                        tx,
                        workspace_id,
                        amount,
                        payment?.id || link.id,
                        `Top-up via Payment Link: ${link.id}`
                    );

                    // 2. Generate Invoice
                    await InvoiceService.createInvoice({
                        tx,
                        workspaceId: workspace_id,
                        items: [{
                            description: "WhatsApp API Credit Top-up",
                            quantity: 1,
                            rate: amount,
                            taxable_value: amount
                        }],
                        billingDetails: {
                            name: payment?.notes?.billing_name || workspace_id,
                            address: "As per records",
                            state: "Karnataka",
                            pincode: "000000",
                            email: payment?.email || "",
                            phone: payment?.contact || ""
                        },
                        paymentId: payment?.id || link.id,
                        paymentMethod: payment?.method || "Razorpay Link"
                    });
                });
            }

            // --- Case B: Edu Lead Enrollment ---
            if (eduLeadId) {
                const { EduService } = require("@/lib/edu/service");
                await EduService.updateLeadStatus(eduLeadId, "ENROLLED");
                console.log(`🎓 EduLead ${eduLeadId} Enrolled via Payment Link`);
            }

            return NextResponse.json({ status: "ok" });
        }


        // --- SUBSCRIPTION EVENTS ---
        if (event.event === "subscription.charged") {
            const subscription = payload.subscription.entity;
            const payment = payload.payment.entity;
            const workspace_id = payment.notes.workspace_id || subscription.notes.source_workspace_id; // Check notes

            if (workspace_id) {
                console.log(`🔄 Subscription Charged: ${payment.amount / 100} for Workspace ${workspace_id}`);

                await prisma.$transaction(async (tx) => {
                    // Log Transaction
                    // @ts-ignore
                    await tx.transaction.create({
                        data: {
                            workspace_id,
                            amount: payment.amount / 100,
                            currency: payment.currency,
                            type: "SUBSCRIPTION_CHARGE",
                            status: "SUCCESS",
                            reference_id: payment.id,
                            description: `Subscription Renewal: ${subscription.plan_id}`
                        }
                    });

                    // Update Workspace Status (if it was halted)
                    await tx.workspace.update({
                        where: { id: workspace_id },
                        data: { subscription_status: "active" }
                    });

                    // --- PHASE 3 & 5: RESELLER COMMISSION (Subscription) ---
                    try {
                        const { ResellerService } = require("@/lib/reseller/service");
                        // Pass the transaction context (tx) instead of the global prisma client
                        await ResellerService.processPaymentCommission(tx, workspace_id, payment.amount / 100, payment.id);
                    } catch (resellerError) {
                        console.error("Reseller Subscription Commission Error:", resellerError);
                    }
                });
            }
            return NextResponse.json({ status: "ok" });
        }

        if (event.event === "subscription.cancelled" || event.event === "subscription.halted") {
            const subscription = payload.subscription.entity;
            const workspace_id = subscription.notes.source_workspace_id || subscription.notes.workspace_id;

            if (workspace_id) {
                console.warn(`⚠️ Subscription ${event.event}: ${subscription.id} for Workspace ${workspace_id}`);

                await prisma.workspace.update({
                    where: { id: workspace_id },
                    data: { subscription_status: "cancelled" } // or halted
                });
            }
            return NextResponse.json({ status: "ok" });
        }

        return NextResponse.json({ status: "ignored" });

    } catch (e) {
        console.error("Webhook Error", e);
        return NextResponse.json({ error: "Webhook Failed" }, { status: 500 });
    }
}
