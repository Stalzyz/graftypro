import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { TransactionStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const body = await req.text();

        // Parse base64 response from PhonePe
        let decoded: any;
        try {
            decoded = JSON.parse(Buffer.from(body, 'base64').toString('utf-8'));
        } catch {
            // If body is not base64, try parsing as JSON directly
            decoded = JSON.parse(body);
        }

        const { merchantTransactionId, code } = decoded;

        console.log(`[PhonePe Webhook] txnId=${merchantTransactionId}, code=${code}`);

        if (!merchantTransactionId) {
            return NextResponse.json({ success: false, error: "Missing transactionId" }, { status: 400 });
        }

        // Look up transaction in DB
        const txn = await prisma.transaction.findFirst({
            where: { reference_id: merchantTransactionId }
        });

        if (!txn) {
            console.error(`[PhonePe Webhook] Transaction not found: ${merchantTransactionId}`);
            return NextResponse.json({ success: false }, { status: 404 });
        }

        if (code === 'PAYMENT_SUCCESS') {
            await prisma.transaction.update({
                where: { id: txn.id },
                data: { status: TransactionStatus.SUCCESS }
            });

            if (txn.workspace_id) {
                // Credit the workspace wallet
                await prisma.vendorWallet.upsert({
                    where: { workspace_id: txn.workspace_id },
                    update: { balance: { increment: txn.amount } } as any,
                    create: { workspace_id: txn.workspace_id, balance: txn.amount } as any
                });
            }

            console.log(`[PhonePe Webhook] ✅ Payment verified, credited ₹${txn.amount} to workspace ${txn.workspace_id}`);
        } else {
            await prisma.transaction.update({
                where: { id: txn.id },
                data: { status: TransactionStatus.FAILED }
            });
            console.warn(`[PhonePe Webhook] ⚠️ Payment not successful: ${code}`);
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("[PhonePe Webhook] Error:", error);
        return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
    }
}
