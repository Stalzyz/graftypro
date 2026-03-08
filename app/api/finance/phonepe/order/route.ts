import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";
import { PhonePeManager } from "../../../../../lib/payments/phonepe";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { amount } = body;

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        const workspaceId = user.workspaceId;
        const txnId = `PHONEPE_${workspaceId}_${Date.now()}`;
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://grafty.pro';

        const config = await PhonePeManager.getConfigForWorkspace(workspaceId);
        const result = await PhonePeManager.createPaymentLink(
            config,
            amount,
            txnId,
            `ws_${workspaceId}`,
            `${baseUrl}/api/webhooks/phonepe`,
            `${baseUrl}/dashboard/billing?txnId=${txnId}&status=success`,
        );

        // Log pending transaction in DB
        // @ts-ignore
        await prisma.transaction.create({
            data: {
                workspace_id: workspaceId,
                amount: amount,
                currency: 'INR',
                type: 'CREDIT_PURCHASE',
                status: 'PENDING',
                description: `PhonePe Wallet Top-Up ₹${amount}`,
                reference_id: txnId,
            }
        });

        return NextResponse.json({ success: true, txnId, redirectUrl: result.redirectUrl });

    } catch (error: any) {
        console.error("PhonePe Order Error:", error);
        return NextResponse.json({ error: error.message || "Failed to initiate PhonePe payment." }, { status: 500 });
    }
}
