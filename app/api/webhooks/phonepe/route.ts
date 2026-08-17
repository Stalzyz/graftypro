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

        // ==========================================
        // PATH A: WhatsApp Flow Customer Payment
        // ==========================================
        if (merchantTransactionId.startsWith('FLOW_')) {
            const parts = merchantTransactionId.split('_');
            const sessionId = parts[1];

            if (!sessionId) {
                return NextResponse.json({ success: false, error: "Invalid Flow Session ID" }, { status: 400 });
            }

            const session = await prisma.flowSession.findUnique({
                where: { id: sessionId },
                include: { contact: true, flow: true }
            });

            if (!session) {
                console.error(`[PhonePe Webhook] FlowSession not found: ${sessionId}`);
                return NextResponse.json({ success: false }, { status: 404 });
            }

            if (code === 'PAYMENT_SUCCESS') {
                console.log(`[PhonePe Webhook] ✅ Flow Payment verified for session ${sessionId}`);

                // 1. Fetch Workspace Settings for Agent Notifications
                const workspace = await prisma.workspace.findUnique({
                    where: { id: session.contact.workspace_id },
                    select: { settings: true, name: true, waba: true }
                });

                if (workspace) {
                    const settings = (workspace.settings as any) || {};
                    const emails = settings.payment_notification_emails || [];

                    if (emails.length > 0) {
                        // Gather context: Last 5 messages
                        const lastMessages = await prisma.message.findMany({
                            where: { contact_id: session.contact.id },
                            orderBy: { created_at: 'desc' },
                            take: 5
                        });

                        const { systemEmailQueue } = await import('../../../../lib/queue');
                        
                        // Send email to all configured agents
                        for (const email of emails) {
                            await systemEmailQueue?.add("send-system-email", {
                                type: "FLOW_PAYMENT_SUCCESS",
                                payload: {
                                    to: email,
                                    vendorName: workspace.name,
                                    customerPhone: session.contact.phone,
                                    customerName: session.contact.name || 'Customer',
                                    txnId: merchantTransactionId,
                                    amount: decoded.amount ? decoded.amount / 100 : 'Unknown', // PhonePe sends in paise
                                    gateway: 'PhonePe',
                                    flowState: session.state || {},
                                    recentMessages: lastMessages.reverse().map(m => `[${m.type}] ${m.text_body || 'Media'}`).join('\\n')
                                }
                            });
                        }
                    }
                    
                    // 2. Resume Flow (Trigger Success Branch of Payment Node)
                    if (workspace.waba) {
                        const { FlowRunner } = await import('@/lib/engine/flow-runner');
                        await FlowRunner.processMessage(session.contact.workspace_id, session.contact.id, "PAYMENT_SUCCESSFUL_INTERNAL_TRIGGER" as any);
                    }
                }
                
            } else {
                console.warn(`[PhonePe Webhook] ⚠️ Flow Payment not successful: ${code}`);
                // Could optionally resume flow with a failure event if supported by builder
            }

            return NextResponse.json({ success: true });
        }

        // ==========================================
        // PATH B: SaaS Vendor Wallet Top-Up
        // ==========================================
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
                
                // Send Payment Success Email with CC to accounting
                const workspace = await prisma.workspace.findUnique({ where: { id: txn.workspace_id }, select: { email: true, name: true }});
                if (workspace?.email) {
                    const { systemEmailQueue } = await import('../../../../lib/queue');
                    await systemEmailQueue?.add("send-system-email", {
                        type: "PAYMENT_SUCCESS",
                        payload: {
                            to: workspace.email,
                            vendorName: workspace.name,
                            amount: txn.amount,
                            currency: "INR",
                            invoiceUrl: ""
                        }
                    });
                }
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
