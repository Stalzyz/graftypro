
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCurrentUser } from "../../../../../lib/auth";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { razorpay_payment_id, razorpay_order_id, razorpay_signature, amount, credits } = body;

        // 1. Verify Signature
        const secret = process.env.RAZORPAY_KEY_SECRET;
        if (!secret) throw new Error("Server Misconfigured: Missing Key Secret");

        const data = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", secret)
            .update(data)
            .digest("hex");

        if (expectedSignature !== razorpay_signature) {
            return NextResponse.json({ error: "Invalid Signature" }, { status: 400 });
        }

        // 2. Atomic Wallet Update
        const wallet = await prisma.vendorWallet.update({
            where: { workspace_id: user.workspaceId },
            data: {
                current_balance: { increment: credits },
                total_purchased: { increment: credits }
            }
        });

        // 3. Log Transaction
        await prisma.creditTransaction.create({
            data: {
                workspace_id: user.workspaceId,
                wallet_id: wallet.id,
                type: "PURCHASE",
                amount: credits,
                balance_before: Number(wallet.current_balance) - credits,
                balance_after: Number(wallet.current_balance),
                description: `Credit Purchase via Razorpay (${razorpay_payment_id})`
            }
        });

        // 4. AUTOMATED MONSTER INVOICE TRIGGER
        const workspace = await prisma.workspace.findUnique({
            where: { id: user.workspaceId }
        });

        if (workspace) {
            try {
                const { InvoiceService } = await import("@/lib/finance/invoice-service");
                await InvoiceService.createInvoice({
                    workspaceId: user.workspaceId,
                    walletId: wallet.id,
                    paymentId: razorpay_payment_id,
                    paymentMethod: "Razorpay",
                    status: "PAID",
                    items: [{
                        description: `Wabot Credit Pack (${credits} Credits)`,
                        hsn_code: "998311",
                        quantity: 1,
                        rate: amount / 1.18,
                        taxable_value: amount / 1.18
                    }],
                    billingDetails: {
                        name: workspace.business_name || workspace.name,
                        address: workspace.billing_address || "Billing Address Not Provided",
                        state: workspace.billing_state || "Karnataka",
                        pincode: workspace.billing_pincode || "000000",
                        email: workspace.billing_email || user.email,
                        gstin: workspace.billing_gstin || undefined
                    }
                });
            } catch (invoiceError) {
                console.error("Automated Invoice failed but credits were added:", invoiceError);
            }
        }

        return NextResponse.json({ success: true, balance: Number(wallet.current_balance) });

    } catch (error: any) {
        console.error("Credits Verification Error:", error);
        return NextResponse.json({ error: "Verification Failed" }, { status: 500 });
    }
}
