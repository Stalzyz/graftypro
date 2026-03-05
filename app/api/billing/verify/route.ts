
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

        let newPlan: "PRO" | "ENTERPRISE" | "FREE" = "PRO"; // Default fallback

        if (planId === PLANS.ENTERPRISE.id) {
            newPlan = "ENTERPRISE";
        } else if (planId === PLANS.PRO.id) {
            newPlan = "PRO";
        } else {
            // Log warning, simplified handling
            console.warn(`Unknown Plan ID: ${planId}, defaulting to PRO`);
        }

        // 3. Activate Plan in DB
        const updatedWorkspace = await prisma.workspace.update({
            where: { id: user.workspaceId },
            data: {
                plan: newPlan as any,
                subscription_status: "active",
                subscription_id: razorpay_subscription_id
            }
        });

        // 4. AUTOMATED MONSTER INVOICE TRIGGER
        try {
            const { InvoiceService } = await import("@/lib/finance/invoice-service");
            const planData = PLANS[newPlan as keyof typeof PLANS];

            await InvoiceService.createInvoice({
                workspaceId: user.workspaceId,
                paymentId: razorpay_payment_id,
                paymentMethod: "Razorpay",
                status: "PAID",
                items: [{
                    description: `Grafty ${newPlan} Subscription (Monthly)`,
                    hsn_code: "998311",
                    quantity: 1,
                    rate: planData.price / 1.18, // Back calculate taxable value from inclusive amount
                    taxable_value: planData.price / 1.18
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

        return NextResponse.json({ success: true, plan: newPlan });

    } catch (error: any) {
        console.error("Verification Error:", error);
        return NextResponse.json({ error: "Verification Failed" }, { status: 500 });
    }
}
