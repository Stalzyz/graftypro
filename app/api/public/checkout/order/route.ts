import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import Razorpay from "razorpay";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { plan_id, reseller_id, vendor_email } = body;

        // 1. Fetch Plan & Reseller securely
        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: plan_id, is_active: true }
        });

        const reseller = await prisma.reseller.findUnique({
            where: { id: reseller_id, status: "APPROVED" }
        });

        if (!plan || !reseller) {
            return NextResponse.json({ error: "Invalid Checkout Session Payload" }, { status: 400 });
        }

        // 2. Extract Partner's Secret Keys
        if (!reseller.payment_gateways || !Array.isArray(reseller.payment_gateways)) {
            return NextResponse.json({ error: "Partner Gateway Configuration Missing" }, { status: 400 });
        }

        const rzKeys = reseller.payment_gateways.find((g: any) => g.provider === "Razorpay");
        if (!rzKeys || !rzKeys.key_id || !rzKeys.key_secret) {
            return NextResponse.json({ error: "Partner Razorpay Credentials Missing" }, { status: 400 });
        }

        // 3. Initialize Partner's instance
        const razorpay = new Razorpay({
            key_id: rzKeys.key_id,
            key_secret: rzKeys.key_secret
        });

        // 4. Generate the Order Payload
        // Razorpay expects amounts in PAISE (INR * 100)
        const amountInPaise = Math.round(Number(plan.monthly_price) * 100);

        const orderOptions = {
            amount: amountInPaise,
            currency: "INR",
            receipt: `rcpt_${reseller.id.substring(0, 8)}_${Date.now()}`,
            notes: {
                vendor_email,
                plan: plan.name,
                type: "Grafty_W2R_Subscription"
            }
        };

        const order = await razorpay.orders.create(orderOptions);

        return NextResponse.json({
            order_id: order.id,
            amount: order.amount,
            currency: order.currency
        });

    } catch (error: any) {
        console.error("Razorpay Order Generation Error:", error);
        return NextResponse.json({
            error: "Failed to allocate secure payment tracking token."
        }, { status: 500 });
    }
}
