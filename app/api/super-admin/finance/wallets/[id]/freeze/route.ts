/**
 * Super Admin - Wallet Freeze/Unfreeze API
 * 
 * POST /api/super-admin/finance/wallets/[id]/freeze
 */

import { NextResponse } from "next/server";
import { prisma } from "../../../../../../../lib/db";
import { requireSuperAdmin } from "../../../../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const admin = await requireSuperAdmin();
        const body = await req.json();
        const { is_frozen, reason } = body;
        const walletId = params.id;

        if (is_frozen === undefined) {
            return NextResponse.json({ error: "Missing freeze status" }, { status: 400 });
        }

        const wallet = await prisma.vendorWallet.findUnique({
            where: { id: walletId }
        });

        if (!wallet) {
            return NextResponse.json({ error: "Wallet not found" }, { status: 404 });
        }

        // Update Wallet
        const updatedWallet = await prisma.vendorWallet.update({
            where: { id: walletId },
            data: {
                is_frozen: is_frozen,
                freeze_reason: reason || (is_frozen ? "Suspicious activity flagged by admin" : null),
                frozen_at: is_frozen ? new Date() : null,
                frozen_by: is_frozen ? (admin.email || admin.id) : null
            }
        });

        // Audit Log
        await prisma.auditLog.create({
            data: {
                admin_id: admin.id,
                admin_email: admin.email || 'system',
                action_type: is_frozen ? 'FREEZE_WALLET' : 'UNFREEZE_WALLET',
                target_type: 'WALLET',
                target_id: walletId,
                target_workspace: wallet.workspace_id,
                before_value: { is_frozen: wallet.is_frozen, reason: wallet.freeze_reason },
                after_value: { is_frozen: is_frozen, reason: reason },
                reason: reason || (is_frozen ? "Freezing wallet" : "Unfreezing wallet")
            }
        });

        return NextResponse.json({
            success: true,
            message: `Wallet ${is_frozen ? 'frozen' : 'unfrozen'} successfully`,
            wallet: updatedWallet
        });

    } catch (error: any) {
        console.error("Wallet Freeze Error:", error);
        return NextResponse.json({ error: error.message || "Operation failed" }, { status: 500 });
    }
}
