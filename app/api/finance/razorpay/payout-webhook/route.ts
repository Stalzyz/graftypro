import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/db";
import { EmailService } from "@/lib/email/service";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const text = await req.text();
        const signature = req.headers.get("x-razorpay-signature");
        const secret = process.env.RAZORPAYX_WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET!;

        // 1. Verify Signature
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(text)
            .digest("hex");

        if (expectedSignature !== signature) {
            console.error("❌ Invalid RazorpayX Payout Webhook Signature");
            return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
        }

        const event = JSON.parse(text);
        const { payload } = event;
        const payout = payload.payout.entity;
        const requestId = payout.reference_id; // This is our ResellerPayoutRequest ID

        console.log(`📡 RazorpayX Payout Webhook: ${event.event} for Request ${requestId}`);

        if (!requestId) return NextResponse.json({ status: "ignored_no_ref" });

        const request = await prisma.resellerPayoutRequest.findUnique({
            where: { id: requestId },
            include: { reseller: true }
        });

        if (!request) {
            console.warn(`⚠️ Payout request ${requestId} not found in DB`);
            return NextResponse.json({ status: "ignored_not_found" });
        }

        // 2. Handle Events
        switch (event.event) {
            case "payout.processed":
            case "payout.updated":
                // If the status is already PAID, no need to do anything
                if (request.status !== "PAID") {
                    await prisma.resellerPayoutRequest.update({
                        where: { id: requestId },
                        data: { 
                            status: "PAID",
                            gateway_payout_id: payout.id,
                            processed_at: new Date()
                        }
                    });

                    // Send Confirmation Alert
                    await EmailService.sendResellerPayoutEmail(request.reseller_id, {
                        amount: Number(request.amount),
                        status: "PAID",
                        payoutId: payout.id
                    });
                }
                break;

            case "payout.reversed":
            case "payout.rejected":
            case "payout.failed":
                // If it was already PAID, we need to REFUND the reseller wallet
                await prisma.$transaction(async (tx) => {
                    const currentRequest = await tx.resellerPayoutRequest.findUnique({
                        where: { id: requestId }
                    });

                    if (currentRequest?.status === "PAID") {
                        const amount = Number(currentRequest.amount);
                        
                        // Increment wallet balance back
                        await tx.reseller.update({
                            where: { id: currentRequest.reseller_id },
                            data: {
                                wallet_balance: { increment: amount }
                            }
                        });

                        // Record reversal in ledger
                        const reseller = await tx.reseller.findUnique({ where: { id: currentRequest.reseller_id } });
                        const balanceAfter = Number(reseller?.wallet_balance || 0);

                        await tx.resellerLedger.create({
                            data: {
                                reseller_id: currentRequest.reseller_id,
                                amount: amount,
                                type: "REFUND_REVERSAL",
                                description: `Payout ${event.event.split('.')[1].toUpperCase()}: Refunded ₹${amount} (RZP: ${payout.id})`,
                                reference_id: requestId,
                                balance_after: balanceAfter
                            }
                        });

                        await tx.resellerPayoutRequest.update({
                            where: { id: requestId },
                            data: { 
                                status: "REJECTED",
                                admin_notes: `Failed via Gateway: ${payout.status_details?.reason || event.event}`
                            }
                        });

                        // Send Failure Alert
                        await EmailService.sendResellerPayoutEmail(currentRequest.reseller_id, {
                            amount: Number(currentRequest.amount),
                            status: event.event === 'payout.reversed' ? 'REVERSED' : 'FAILED',
                            payoutId: payout.id,
                            reason: payout.status_details?.description || payout.status_details?.reason || event.event
                        });
                    }
                });
                break;

            default:
                console.log(`ℹ️ Unhandled Payout Event: ${event.event}`);
        }

        return NextResponse.json({ status: "ok" });

    } catch (e) {
        console.error("Payout Webhook Error", e);
        return NextResponse.json({ error: "Webhook Failed" }, { status: 500 });
    }
}
