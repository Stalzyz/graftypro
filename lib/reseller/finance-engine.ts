
import { prisma } from "../db";
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
        // 1. Lock the reseller row for concurrency protection (Atomic Audit Trail)
        // This prevents multiple webhooks or parallel processes from reading the same balance 
        // leading to duplicate balance_after values.
        const resellers: any[] = await tx.$queryRaw`SELECT wallet_balance FROM resellers WHERE id = ${resellerId} FOR UPDATE`;
        const reseller = resellers[0];

        if (!reseller) throw new Error("Reseller not found for ledger entry");

        const currentBalance = Number(reseller.wallet_balance);
        const newBalance = currentBalance + amount;

        // 2. Create the immutable ledger entry
        let ledgerEntry;
        try {
            ledgerEntry = await tx.resellerLedger.create({
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
        } catch (e: any) {
            if (e.code === 'P2002') {
                console.warn(`[Finance Engine] Duplicate transaction skipped: ${type} for ${referenceId}`);
                return null;
            }
            throw e;
        }

        if (!ledgerEntry) return null;

        // 3. Update the liquid wallet balance
        await tx.reseller.update({
            where: { id: resellerId },
            data: {
                wallet_balance: { increment: amount },
                total_earned: (type === 'COMMISSION' && amount > 0) ? { increment: amount } : undefined
            }
        });

        return ledgerEntry;
    }

    /**
     * UNIFIED WALLET LEDGER ESCROW SYSTEM (Phase 8)
     * Deducts the Wholesale Base Cost of a Custom Subscription from the Partner's Wallet.
     * Throws an error if the Partner lacks sufficient prepaid funds, preventing vendor provisioning.
     */
    static async processPartnerSubscriptionDeduction(tx: any, {
        resellerId,
        workspaceId,
        wholesaleCost,
        retailPrice,
        planName
    }: {
        resellerId: string;
        workspaceId: string;
        wholesaleCost: number;
        retailPrice: number;
        planName: string;
    }) {
        if (wholesaleCost <= 0) return true; // Free system plan

        // 1. Lock Reseller Row (Atomic check)
        const resellers: any[] = await tx.$queryRaw`SELECT wallet_balance FROM resellers WHERE id = ${resellerId} FOR UPDATE`;
        const reseller = resellers[0];

        if (!reseller) throw new Error("Partner ledger not found.");

        const currentBalance = Number(reseller.wallet_balance);

        // 2. Strict Escrow Verification
        if (currentBalance < wholesaleCost) {
            console.error(`[Escrow Failure] Reseller ${resellerId} lacks funds. Need ${wholesaleCost}, Has ${currentBalance}`);
            throw new Error(`INSUFFICIENT_FUNDS: Partner Wallet balance (₹${currentBalance}) is too low to cover the wholesale cost (₹${wholesaleCost}) of this subscription.`);
        }

        // 3. Deduct Wholesale Cost (BSP Revenue)
        const ledgerEntry = await tx.resellerLedger.create({
            data: {
                reseller_id: resellerId,
                workspace_id: workspaceId,
                amount: -wholesaleCost,
                balance_after: currentBalance - wholesaleCost,
                type: "SUBSCRIPTION_FEE",
                description: `Wholesale Cost Deduction: Vendor Subscription [${planName}]`,
                reference_id: `SUB-${workspaceId}-${Date.now()}`
            }
        });

        // 4. Update Liquid Wallet
        await tx.reseller.update({
            where: { id: resellerId },
            data: {
                wallet_balance: { decrement: wholesaleCost }
            }
        });

        // 5. Track Partner Profit in Monthly Stats (Information Only - Retail price collected externally)
        const partnerProfit = retailPrice - wholesaleCost;
        if (partnerProfit > 0) {
            const now = new Date();
            await tx.resellerMonthlyStats.upsert({
                where: {
                    reseller_id_month_year: {
                        reseller_id: resellerId,
                        month: now.getMonth() + 1,
                        year: now.getFullYear()
                    }
                },
                update: {
                    total_revenue: { increment: retailPrice },
                    net_profit: { increment: partnerProfit }
                },
                create: {
                    reseller_id: resellerId,
                    month: now.getMonth() + 1,
                    year: now.getFullYear(),
                    total_revenue: retailPrice,
                    net_profit: partnerProfit
                }
            });
        }

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
