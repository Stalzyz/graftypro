
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import crypto from "crypto";
import { saasRazorpay, PLANS } from "@/lib/saas/razorpay";

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
        await prisma.workspace.update({
            where: { id: user.workspaceId },
            data: {
                // @ts-ignore
                plan: newPlan,
                subscription_status: "active",
                subscription_id: razorpay_subscription_id
            }
        });

        return NextResponse.json({ success: true, plan: newPlan });

    } catch (error: any) {
        console.error("Verification Error:", error);
        return NextResponse.json({ error: "Verification Failed" }, { status: 500 });
    }
}
