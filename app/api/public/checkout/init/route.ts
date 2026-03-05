import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const plan_id = searchParams.get("plan_id");

        if (!plan_id) return NextResponse.json({ error: "Missing Plan Identifier" }, { status: 400 });

        const plan = await prisma.subscriptionPlan.findUnique({
            where: { id: plan_id, is_active: true }
        });

        if (!plan) return NextResponse.json({ error: "Commercial License Not Found or Inactive" }, { status: 404 });

        // Retrieve the Partner's Public Settings (Branding & Gateway Type)
        const reseller = await prisma.reseller.findUnique({
            where: { id: plan.reseller_id, status: "APPROVED" },
            select: {
                id: true,
                name: true,
                business_name: true,
                brand_name: true,
                branding_settings: true,
                // We purposefully DO NOT return the key_secret here. 
                // Only key_id is safe for the public frontend to init Razorpay.js
                // However, Prisma makes mapping JSON blocks tricky, so we fetch it all and sanitize in JS.
                payment_gateways: true
            }
        });

        if (!reseller) return NextResponse.json({ error: "Partner Network Unavailable" }, { status: 404 });

        // Sanitize the Gateway array to strip secrets before sending to frontend
        let safeGateways = [];
        if (reseller.payment_gateways && Array.isArray(reseller.payment_gateways)) {
            safeGateways = reseller.payment_gateways.map((g: any) => ({
                provider: g.provider,
                key_id: g.key_id // Safe to expose. Equivalent to Stripe Publishable Key.
                // key_secret is DROPPED.
            }));
        }

        return NextResponse.json({
            plan,
            reseller: { ...reseller, payment_gateways: safeGateways }
        });

    } catch (error) {
        console.error("Public Checkout Init Error:", error);
        return NextResponse.json({ error: "Engine Initialization Failed" }, { status: 500 });
    }
}
