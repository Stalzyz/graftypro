/**
 * Super Admin - Credit Adjustment API
 * 
 * POST /api/super-admin/credits/adjust
 */

import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { requireSuperAdmin } from "../../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const admin = await requireSuperAdmin();
        const body = await req.json();
        const { workspaceId, amount, type, reason } = body;

        if (!workspaceId || amount === undefined || !type) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const adjustmentAmount = Number(amount);
        if (isNaN(adjustmentAmount)) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        const result = await prisma.$transaction(async (tx) => {
            // 1. Get Wallet with Row Lock (Monster Mode: Concurrency Protection)
            // Explicitly lock the row for the duration of the transaction
            const wallets = await tx.$queryRawUnsafe<any[]>(
                `SELECT * FROM "vendor_wallets" WHERE "workspace_id" = $1 FOR UPDATE`,
                workspaceId
            );

            const wallet = wallets[0];

            if (!wallet) throw new Error("Vendor wallet not found");

            const balanceBefore = Number(wallet.current_balance);
            const balanceAfter = balanceBefore + adjustmentAmount;

            // 2. Update Wallet
            const updatedWallet = await tx.vendorWallet.update({
                where: { id: wallet.id },
                data: {
                    current_balance: { increment: adjustmentAmount },
                    // If adding credits, increment total purchased (optional, admin choice)
                    total_purchased: adjustmentAmount > 0 ? { increment: adjustmentAmount } : undefined,
                }
            });

            // 3. Create Ledger Entry
            const transaction = await tx.creditTransaction.create({
                data: {
                    workspace_id: workspaceId,
                    wallet_id: wallet.id,
                    type: adjustmentAmount > 0 ? 'PURCHASE' : 'DEDUCTION', // Labeling as purchase/deduction for user visibility
                    amount: adjustmentAmount,
                    balance_before: balanceBefore,
                    balance_after: balanceAfter,
                    description: `${type}: ${reason} (Ref: Admin-${admin.email})`,
                    status: 'COMPLETED',
                    initiated_by: admin.email || admin.id
                }
            });

            // 4. Create Audit Log (Immutable)
            await tx.auditLog.create({
                data: {
                    admin_id: admin.id,
                    admin_email: admin.email || 'system',
                    action_type: 'ADJUST_CREDITS',
                    target_type: 'WALLET',
                    target_id: wallet.id,
                    target_workspace: workspaceId,
                    before_value: { balance: balanceBefore },
                    after_value: { balance: balanceAfter },
                    reason: `${type}: ${reason}`
                }
            });

            return { wallet: updatedWallet, transaction };
        }, {
            timeout: 10000
        });

        return NextResponse.json({
            success: true,
            message: "Credits adjusted successfully",
            data: result
        });

    } catch (error: any) {
        console.error("Credit Adjustment API Error:", error);
        return NextResponse.json({ error: error.message || "Adjustment failed" }, { status: 500 });
    }
}
