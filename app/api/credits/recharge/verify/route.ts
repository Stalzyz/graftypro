
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCurrentUser } from "../../../../../lib/auth";
import { CreditService } from "../../../../../lib/credits/service";
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

        // 1.5 Recalculate Credits on Backend for Security (Do not trust client 'credits' field)
        const recalculateCredits = CreditService.calculateRechargeCredits(amount / 1.18); // amount is total including GST, but bonus is on base amount
        // Wait, amount in verify API is the order amount (paise)? 
        // Let's check initiate API: orderAmount = Math.round(gstBreakdown.total_amount * 100);
        // So amount in verify is total_amount * 100.
        const baseAmount = Math.round(amount / 118); // Approx base amount from total (amount is paise, 118 is 1.18 * 100)
        const finalCredits = CreditService.calculateRechargeCredits(baseAmount);

        // 2. Atomic Wallet Update
        const wallet = await prisma.vendorWallet.update({
            where: { workspace_id: user.workspaceId },
            data: {
                current_balance: { increment: finalCredits },
                total_purchased: { increment: finalCredits }
            }
        });

        // 3. Log Transaction
        await prisma.creditTransaction.create({
            data: {
                workspace_id: user.workspaceId,
                wallet_id: wallet.id,
                type: "PURCHASE",
                amount: finalCredits,
                balance_before: Number(wallet.current_balance) - finalCredits,
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
                        description: `Grafty Credit Pack (${finalCredits} Credits)`,
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
