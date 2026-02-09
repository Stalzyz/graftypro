import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireSuperAdmin } from "@/lib/admin-auth";
import { CreditService } from "@/lib/credits/service";

/**
 * PHASE 6: ADMIN CREDIT ADJUSTMENT
 * Allows manual credit injection or deduction by Super Admins.
 * MUST create a ledger entry for audit.
 */
export async function POST(req: Request) {
    try {
        const admin = await requireSuperAdmin();
        const body = await req.json();
        const { workspaceId, amount, description } = body;

        if (!workspaceId || amount === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Get Wallet
            const wallet = await tx.vendorWallet.findUnique({
                where: { workspace_id: workspaceId }
            });

            if (!wallet) throw new Error("Vendor wallet not found");

            const balanceBefore = Number(wallet.current_balance);
            const balanceAfter = balanceBefore + Number(amount);

            // 2. Update Wallet
            const updatedWallet = await tx.vendorWallet.update({
                where: { id: wallet.id },
                data: {
                    current_balance: { increment: amount }
                }
            });

            // 3. Create Ledger Entry (Append-only)
            await tx.creditTransaction.create({
                data: {
                    workspace_id: workspaceId,
                    type: 'ADJUSTMENT',
                    amount: amount,
                    balance_before: balanceBefore,
                    balance_after: balanceAfter,
                    description: `Admin Adjustment: ${description} (by ${admin.email})`
                }
            });

            return updatedWallet;
        });

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error: any) {
        console.error("Credit Adjustment Error:", error);
        return NextResponse.json({ error: error.message || "Adjustment failed" }, { status: 500 });
    }
}
