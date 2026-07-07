
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";
import crypto from "crypto";
import { saasRazorpay, PLANS } from "../../../../lib/saas/razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = body;

        // 1. Verify Signature
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) throw new Error("Server Misconfigured: Missing Key Secret");

        // Correct format: razorpay_payment_id + "|" + razorpay_subscription_id
        const data = razorpay_payment_id + "|" + razorpay_subscription_id;

        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(data)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
        }

        // 2. Fetch Subscription to Identify Plan
        const subscription = await saasRazorpay.subscriptions.fetch(razorpay_subscription_id);
        const planId = subscription.plan_id;

        // Detect Plan Name directly from the secure Razorpay notes we injected during checkout!
        let newPlan = subscription.notes?.plan;

        if (!newPlan) {
            throw new Error(`Critical Error: Could not resolve plan name from notes for Razorpay Plan ID ${planId}`);
        }

        // Database Lookup for the actual plan (Safe, no invalid keys)
        const dbPlanRecord = await prisma.subscriptionPlan.findFirst({
            where: { name: { equals: newPlan, mode: 'insensitive' } }
        });

        if (dbPlanRecord) {
            newPlan = dbPlanRecord.name; // Normalize case
        } else {
             throw new Error(`Critical Error: Plan ${newPlan} no longer exists in database.`);
        }

        const normalizePlanEnum = (name: string) => {
            const n = name.toUpperCase();
            if (n.includes("FREE")) return "FREE";
            if (n.includes("ENTERPRISE")) return "ENTERPRISE";
            return "PRO"; // All dynamic premium plans fall under PRO enum mapping
        };

        // 3. Activate Plan in DB
        const updatedWorkspace = await prisma.workspace.update({
            where: { id: user.workspaceId },
            data: {
                plan: normalizePlanEnum(newPlan) as any,
                subscription_status: "active",
                subscription_id: razorpay_subscription_id,
                current_plan_id: dbPlanRecord?.id || null
            }
        });

        // 3.5 Add Bonus Credits from Plan
        const dbPlan = await prisma.subscriptionPlan.findUnique({
            where: { name: newPlan }
        });

        if (dbPlan && dbPlan.credits > 0) {
            const wallet = await prisma.vendorWallet.update({
                where: { workspace_id: user.workspaceId },
                data: {
                    current_balance: { increment: dbPlan.credits }
                }
            });

            // Log the "Welcome Credits"
            await prisma.creditTransaction.create({
                data: {
                    workspace_id: user.workspaceId,
                    wallet_id: wallet.id,
                    type: "PURCHASE",
                    amount: dbPlan.credits,
                    balance_before: Number(wallet.current_balance) - dbPlan.credits,
                    balance_after: Number(wallet.current_balance),
                    description: `Plan Welcome Credits (${newPlan} Package)`
                }
            });
        }

        // 4. AUTOMATED MONSTER INVOICE TRIGGER
        try {
            const { InvoiceService } = await import("@/lib/finance/invoice-service");
            const price = Number((dbPlanRecord as any).monthly_price || (dbPlanRecord as any).price || 0);

            await InvoiceService.createInvoice({
                workspaceId: user.workspaceId,
                paymentId: razorpay_payment_id,
                paymentMethod: "Razorpay",
                status: "PAID",
                items: [{
                    description: `Grafty ${newPlan} Subscription`,
                    hsn_code: "998311",
                    quantity: 1,
                    rate: price / 1.18, // Back calculate taxable value from inclusive amount
                    taxable_value: price / 1.18
                }],
                billingDetails: {
                    name: updatedWorkspace.business_name || updatedWorkspace.name,
                    address: updatedWorkspace.billing_address || "Billing Address Not Provided",
                    state: updatedWorkspace.billing_state || "Karnataka",
                    pincode: updatedWorkspace.billing_pincode || "000000",
                    email: updatedWorkspace.billing_email || user.email,
                    gstin: updatedWorkspace.billing_gstin || undefined
                }
            });
        } catch (invoiceError) {
            console.error("Automated Invoice failed but subscription was activated:", invoiceError);
        }

        // 4. Update usage stats for coupons
        const wsForCoupon = await prisma.workspace.findUnique({
            where: { id: user.workspaceId },
            select: { global_coupon_id: true, coupon_id: true }
        });

        if (wsForCoupon?.global_coupon_id) {
            await prisma.globalCoupon.update({
                where: { id: wsForCoupon.global_coupon_id },
                data: { usage_count: { increment: 1 } }
            });
        } else if (wsForCoupon?.coupon_id) {
            await prisma.resellerCoupon.update({
                where: { id: wsForCoupon.coupon_id },
                data: { usage_count: { increment: 1 } }
            });
        }

        // 5. Send Notifications (Email + WhatsApp)
        try {
            const { NotificationService } = await import("@/lib/notifications/service");
            // Welcome notification (Unifies Email + WhatsApp)
            await NotificationService.sendWelcomeNotification(user.id);
        } catch (notifError) {
            console.error("Automated notifications failed:", notifError);
        }

        return NextResponse.json({ success: true, plan: newPlan });

    } catch (error: any) {
        console.error("Verification Error:", error);
        return NextResponse.json({ error: "Verification Failed" }, { status: 500 });
    }
}
