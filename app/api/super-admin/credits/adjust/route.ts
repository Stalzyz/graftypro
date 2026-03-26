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
            // 1 & 2. Perform Atomic Increment Update directly
            const updatedWallet = await tx.vendorWallet.update({
                where: { workspace_id: workspaceId },
                data: {
                    current_balance: { increment: adjustmentAmount },
                    total_purchased: adjustmentAmount > 0 ? { increment: adjustmentAmount } : undefined,
                }
            });

            const balanceAfter = Number(updatedWallet.current_balance);
            const balanceBefore = balanceAfter - adjustmentAmount;
            const wallet = updatedWallet;

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
