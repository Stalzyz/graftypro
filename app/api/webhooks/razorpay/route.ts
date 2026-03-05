import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const body = await req.text();
        const signature = req.headers.get("x-razorpay-signature");
        const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

        // 1. Validate Webhook Signature (War Mode: Anti-Spoofing)
        if (secret && signature) {
            const expectedSignature = crypto
                .createHmac("sha256", secret)
                .update(body)
                .digest("hex");

            if (expectedSignature !== signature) {
                console.error("❌ Razorpay Webhook Signature Mismatch!");
                return NextResponse.json({ error: "Invalid Signature" }, { status: 403 });
            }
        } else if (process.env.NODE_ENV === 'production') {
            console.warn("⚠️ Razorpay Webhook received without signature/secret in Production!");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = JSON.parse(body);
        const event = payload.event;

        if (event === "subscription.charged") {
            const subEntity = payload.payload.subscription.entity;
            const paymentEntity = payload.payload.payment.entity;
            const workspaceId = subEntity.notes?.workspaceId;

            if (workspaceId) {
                console.log(`🔄 Subscription charged for Workspace ${workspaceId}: ₹${paymentEntity.amount / 100}`);

                // 1. Create Invoice
                const { InvoiceService } = await import("@/lib/finance/invoice-service");
                const { SystemConfigService } = await import("@/lib/services/system-config-service");

                // Calculate tax breakup (assuming 18% GST inclusive for SaaS)
                const totalAmount = paymentEntity.amount / 100;
                const sysConfig = await SystemConfigService.getConfig();
                const taxConfig = (sysConfig as any).tax_config || {};
                // If default is 18%, taxable is total / 1.18
                // But wait, subscription usually is Amount + GST. Let's assume inclusive for simplicity or extract from notes if passed.
                // Better approach: Treat as a single line item

                const taxableValue = totalAmount / 1.18; // Back-calculate assuming 18% inclusive

                // Fetch customer details from Workspace
                const workspace = await prisma.workspace.findUnique({
                    where: { id: workspaceId }
                });

                if (workspace) {
                    const invoice = await InvoiceService.createInvoice({
                        workspaceId: workspaceId,
                        billingDetails: {
                            name: paymentEntity.notes?.billing_name || workspace.name || "Valued Customer",
                            email: paymentEntity.email || "support@grafty.pro", // Fallback if no email in payment/workspace
                            gstin: paymentEntity.notes?.gstin,
                            address: paymentEntity.notes?.address || "Karnataka, India", // Default if missing
                            state: paymentEntity.notes?.state || "Karnataka",
                            pincode: paymentEntity.notes?.pincode || ""
                        },
                        items: [{
                            description: `Subscription Renewal - ${subEntity.plan_id}`,
                            hsn_code: "998439", // SaaS HSN
                            quantity: 1,
                            rate: taxableValue,
                            taxable_value: taxableValue
                        }],
                        paymentMethod: "RAZORPAY_SUBSCRIPTION",
                        paymentId: paymentEntity.id,
                        status: "PAID"
                    });

                    console.log(`📄 Subscription Invoice Generated: ${invoice.invoice_number}`);

                    // 2. Email Invoice
                    await InvoiceService.sendInvoiceEmail(invoice.id);
                }
            }
        }

        if (event === "payment.captured") {
            const payment = payload.payload.payment.entity;
            const workspaceId = payment.notes?.workspaceId;
            const type = payment.notes?.type; // 'CREDIT_PURCHASE', 'RESELLER_TOPUP', 'SUBSCRIPTION_ADHOC'

            if (workspaceId) {
                // Determine billing details
                const billingDetails = {
                    name: payment.notes?.billingName || payment.notes?.customerName || 'Customer',
                    address: payment.notes?.billingAddress || 'Address',
                    state: payment.notes?.billingState || 'Karnataka',
                    pincode: payment.notes?.billingPincode || '560001',
                    gstin: payment.notes?.gstin || null,
                    email: payment.email || payment.notes?.email || null,
                    phone: payment.contact || payment.notes?.phone || null
                };

                // A. Credit Purchase
                if (type === "CREDIT_PURCHASE") {
                    const netAmount = parseInt(payment.notes?.netAmount || "0");
                    if (netAmount > 0) {
                        const { CreditService } = await import("@/lib/credits/service");
                        // ... existing credit logic ...
                        const result = await prisma.$transaction(async (tx) => {
                            return await CreditService.addCreditsWithGST(
                                tx,
                                workspaceId,
                                netAmount,
                                payment.id,
                                `Razorpay Payment: ${payment.id}`,
                                billingDetails
                            );
                        });

                        if (!result.duplicate && result.invoice) {
                            const { InvoiceService } = await import("@/lib/finance/invoice-service");
                            await InvoiceService.sendInvoiceEmail(result.invoice.id);
                        }
                    }
                }

                // B. Reseller Top-up
                else if (type === "RESELLER_TOPUP") {
                    // Similar logic to credits but for reseller balance
                    console.log("Reseller Topup Detected - Implementation pending check");
                }

                // C. Fallback: Generate Invoice for Generic Payment if not handled elsewhere
                else {
                    // Check if invoice already exists
                    const { InvoiceService } = await import("@/lib/finance/invoice-service");
                    const exists = await prisma.invoice.findFirst({ where: { payment_id: payment.id } });

                    if (!exists) {
                        // Create generic invoice
                        const totalAmount = payment.amount / 100;
                        const taxableValue = totalAmount / 1.18;

                        const invoice = await InvoiceService.createInvoice({
                            workspaceId: workspaceId,
                            billingDetails: billingDetails as any,
                            items: [{
                                description: payment.description || "Ad-hoc Payment",
                                quantity: 1,
                                rate: taxableValue,
                                taxable_value: taxableValue
                            }],
                            paymentMethod: "RAZORPAY",
                            paymentId: payment.id,
                            status: "PAID"
                        });
                        await InvoiceService.sendInvoiceEmail(invoice.id);
                    }
                }
            }
        }

        if (event === "payment_link.paid") {
            // ... existing login ...
            const paymentLink = payload.payload.payment_link.entity;
            const workspaceId = paymentLink.notes?.workspaceId;
            const phone = paymentLink.customer.contact;
            const cleanPhone = phone.replace('+', '');

            // ... contact update logic ...
            const contact = await prisma.contact.findFirst({
                where: {
                    workspace_id: workspaceId,
                    phone: cleanPhone
                }
            });

            if (contact) {
                const currentTags = contact.tags || [];
                if (!currentTags.includes("Paid_Customer")) {
                    await prisma.contact.update({ where: { id: contact.id }, data: { tags: [...currentTags, "Paid_Customer"] } });
                }
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
