import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getResellerSession } from "@/lib/reseller/auth-helper";
import Razorpay from "razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { amount } = await req.json();

        if (!amount || typeof amount !== 'number' || amount < 100) {
            return NextResponse.json({ error: "Minimum top-up is ₹100." }, { status: 400 });
        }

        // 1. Fetch Super Admin Master Keys
        const config = await prisma.systemConfig.findFirst({
            where: { id: "global" }
        });

        let masterKeys;
        try {
            const gateways = typeof config?.payment_gateways === 'string'
                ? JSON.parse(config.payment_gateways)
                : config?.payment_gateways;
            masterKeys = Array.isArray(gateways) ? gateways[0] : null;
        } catch (e) {
            masterKeys = null;
        }

        if (!masterKeys?.key_id || !masterKeys?.key_secret) {
            return NextResponse.json({ error: "Super Admin Payment Gateway is not configured." }, { status: 500 });
        }

        // 2. Initialize Razorpay with Master Keys
        const razorpay = new Razorpay({
            key_id: masterKeys.key_id,
            key_secret: masterKeys.key_secret,
        });

        const orderAmount = Math.round(amount * 100); // Amount in paise

        // 3. Create the Order
        let order;
        try {
            order = await razorpay.orders.create({
                amount: orderAmount,
                currency: 'INR',
                // Razorpay receipt ID limited to 40 characters. 
                // UUID (36) + "escrow_" (7) was definitely exceeding it.
                receipt: `esc_${session.userId.slice(0, 8)}_${Date.now().toString().slice(-10)}`,
                notes: {
                    type: 'ESCROW_TOPUP',
                    resellerId: session.userId,
                }
            });
        } catch (rzpError: any) {
            console.error("Razorpay Order Creation Details:", {
                message: rzpError.message,
                metadata: rzpError.metadata,
                stack: rzpError.stack
            });
            throw new Error(`Razorpay Error: ${rzpError.message || 'Failed to create order'}`);
        }

        return NextResponse.json({
            success: true,
            order: {
                id: order.id,
                amount: orderAmount,
                currency: 'INR',
                razorpay_key: masterKeys.key_id,
            }
        });

    } catch (error: any) {
        console.error("Escrow Top Up Order Error:", error);
        return NextResponse.json({ error: error.message || "Failed to create payment order" }, { status: 500 });
    }
}
