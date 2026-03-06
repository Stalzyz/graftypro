import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getResellerSession } from "../../../../../lib/reseller/auth-helper";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, amount } = body;

        // 1. Fetch Master Keys
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

        const secret = masterKeys?.key_secret;
        if (!secret) throw new Error("Server Misconfigured: Missing Key Secret");

        // 2. Verify Signature
        const data = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(data)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
        }

        // 3. Prevent Duplicate Processing
        const existingTx = await prisma.resellerLedger.findFirst({
            where: { reference_id: razorpay_payment_id }
        });

        if (existingTx) {
            return NextResponse.json({ success: true, message: "Already processed" });
        }

        // 4. Atomic Wallet Update
        const updatedReseller = await prisma.reseller.update({
            where: { id: session.userId },
            data: {
                wallet_balance: { increment: amount }
            }
        });

        // 5. Log Transaction
        await prisma.resellerLedger.create({
            data: {
                reseller_id: session.userId,
                type: "ADJUSTMENT",
                amount: amount,
                balance_after: updatedReseller.wallet_balance,
                reference_id: razorpay_payment_id,
                description: `Escrow Funding via Master Gateway (${razorpay_payment_id})`
            }
        });

        return NextResponse.json({ success: true, balance: Number(updatedReseller.wallet_balance) });

    } catch (error: any) {
        console.error("Escrow Verification Error:", error);
        return NextResponse.json({ error: "Verification Failed" }, { status: 500 });
    }
}
