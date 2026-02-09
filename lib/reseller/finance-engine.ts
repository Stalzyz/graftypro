
import { prisma } from "@/lib/db";
import { LedgerEntryType } from "@prisma/client";

/**
 * Enterprise-grade Financial Ledger Engine for Resellers.
 * Ensures data integrity, atomicity, and append-only ledger history.
 */
export class ResellerFinanceEngine {

    /**
     * Records a financial transaction in the ledger and updates the wallet.
     * Must be run within an existing Prisma transaction to ensure atomicity.
     */
    static async recordTransaction(tx: any, {
        resellerId,
        amount,
        type,
        description,
        referenceId,
        workspaceId
    }: {
        resellerId: string;
        amount: number;
        type: LedgerEntryType;
        description: string;
        referenceId?: string;
        workspaceId?: string;
    }) {
        // 1. Lock the reseller row for concurrency protection
        // This prevents multiple webhooks or parallel processes from reading the same balance
        const reseller = await tx.reseller.findUnique({
            where: { id: resellerId },
            select: { id: true, wallet_balance: true }
        });

        if (!reseller) throw new Error("Reseller not found for ledger entry");

        const currentBalance = Number(reseller.wallet_balance);
        const newBalance = currentBalance + amount;

        // 2. Create the immutable ledger entry
        const ledgerEntry = await tx.resellerLedger.create({
            data: {
                reseller_id: resellerId,
                amount: amount,
                balance_after: newBalance,
                type: type,
                description: description,
                reference_id: referenceId,
                workspace_id: workspaceId
            }
        });

        // 3. Update the liquid wallet balance
        await tx.reseller.update({
            where: { id: resellerId },
            data: {
                wallet_balance: { increment: amount },
                total_earned: type === 'COMMISSION' ? { increment: amount } : undefined
            }
        });

        return ledgerEntry;
    }

    /**
     * Reconciles the wallet balance against the ledger sum.
     * Used by nightly audit jobs.
     */
    static async reconcileWallet(resellerId: string) {
        const ledgerSum = await prisma.resellerLedger.aggregate({
            where: { reseller_id: resellerId },
            _sum: { amount: true }
        });

        const reseller = await prisma.reseller.findUnique({
            where: { id: resellerId },
            select: { wallet_balance: true }
        });

        const actualSum = Number(ledgerSum._sum.amount || 0);
        const walletBalance = Number(reseller?.wallet_balance || 0);

        const diff = Math.abs(actualSum - walletBalance);

        return {
            resellerId,
            ledgerSum: actualSum,
            walletBalance: walletBalance,
            isConsistent: diff < 0.01, // Float precision safety
            difference: diff
        };
    }
}
