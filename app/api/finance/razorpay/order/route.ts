import { NextResponse } from "next/server";
import { createOrder } from "../../../../../lib/saas/razorpay";

export const dynamic = 'force-dynamic';
import { getCurrentUser } from "../../../../../lib/auth"; // Standard auth helper
import { prisma } from "../../../../../lib/db";

export async function POST(req: Request) {
    try {
        // 1. Verify User
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { amount, currency = "INR", description } = body;

        // 2. Validate Limits (Min 500, Max 10,000)
        if (amount < 500 || amount > 10000) {
            return NextResponse.json({
                error: "Invalid Amount",
                details: "Recharge must be between ₹500 and ₹10,000"
            }, { status: 400 });
        }

        // Calculate Final with 18% GST (Note: Razorpay expects total in paise)
        const gstAmount = Math.round(amount * 0.18);
        const finalAmount = amount + gstAmount;

        // 3. Create Razorpay Order
        const order = await createOrder(finalAmount, currency, {
            workspace_id: user.workspaceId,
            user_id: user.userId,
            base_amount: amount,
            gst_amount: gstAmount,
            description: description || `Wallet Topup (₹${amount} + 18% GST)`
        });

        // 4. Log Pending Transaction in DB
        // @ts-ignore
        await prisma.transaction.create({
            data: {
                workspace_id: user.workspaceId,
                amount: finalAmount,
                currency: currency,
                type: "CREDIT_PURCHASE",
                status: "PENDING",
                description: description || `Wallet Topup (₹${amount} + 18% GST)`,
                reference_id: order.id
            }
        });

        return NextResponse.json(order);

    } catch (e: any) {
        console.error("Razorpay Order Error", e);
        return NextResponse.json({ error: e.message || "Order Creation Failed" }, { status: 500 });
    }
}
