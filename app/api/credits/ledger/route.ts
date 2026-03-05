
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const workspaceId = user.workspaceId;

        // 1. Get Wallet Balance
        const wallet = await prisma.vendorWallet.findUnique({
            where: { workspace_id: workspaceId }
        });

        // 2. Get Recent Transactions
        const transactions = await prisma.creditTransaction.findMany({
            where: { workspace_id: workspaceId },
            orderBy: { created_at: "desc" },
            take: 50
        });

        return NextResponse.json({
            balance: Number(wallet?.current_balance || 0),
            transactions: transactions.map(tx => ({
                id: tx.id,
                type: tx.type,
                amount: Number(tx.amount),
                balance_after: Number(tx.balance_after),
                description: tx.description,
                message_category: tx.message_category,
                meta_message_id: tx.meta_message_id,
                created_at: tx.created_at
            }))
        });

    } catch (error: any) {
        console.error("Credit Ledger API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
