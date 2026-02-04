
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } = body;

        // 1. Verify Signature
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) throw new Error("Server Misconfigured: Missing Key Secret");

        // subscription_id + "|" + payment_id
        const data = razorpay_subscription_id + "|" + razorpay_payment_id;

        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(data.toString())
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
        }

        // 2. Activate Plan in DB
        // We assume upgrading to the plan associated with this subscription
        // In a real app, we check which plan ID this sub belongs to, but for MVP we assume PRO if success here
        // or check pending state.

        await prisma.workspace.update({
            where: { id: user.workspaceId },
            data: {
                plan: "PRO", // Upgrade!
                subscription_status: "active",
                subscription_id: razorpay_subscription_id
            }
        });

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Verification Error:", error);
        return NextResponse.json({ error: "Verification Failed" }, { status: 500 });
    }
}
