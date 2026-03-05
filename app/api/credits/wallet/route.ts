import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get or create wallet
        let wallet = await prisma.vendorWallet.findUnique({
            where: { workspace_id: user.workspaceId }
        });

        if (!wallet) {
            wallet = await prisma.vendorWallet.create({
                data: { workspace_id: user.workspaceId }
            });
        }

        // Get recent transactions
        const transactions = await prisma.creditTransaction.findMany({
            where: { workspace_id: user.workspaceId },
            orderBy: { created_at: "desc" },
            take: 50
        });

        return NextResponse.json({
            success: true,
            wallet: {
                current_balance: Number(wallet.current_balance),
                total_purchased: Number(wallet.total_purchased),
                total_used: Number(wallet.total_used),
                is_frozen: wallet.is_frozen,
                freeze_reason: wallet.freeze_reason
            },
            transactions: transactions.map(tx => ({
                id: tx.id,
                type: tx.type,
                amount: Number(tx.amount),
                balance_before: Number(tx.balance_before),
                balance_after: Number(tx.balance_after),
                description: tx.description,
                created_at: tx.created_at.toISOString()
            }))
        });

    } catch (error: any) {
        console.error("Wallet API Error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
