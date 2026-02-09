import { prisma } from "@/lib/db";
import crypto from "crypto";

export class ResellerService {
    /**
     * Generates a unique, URL-safe referral code.
     * Format: GREK-[WORD][RAND]
     */
    static async generateReferralCode(name: string): Promise<string> {
        const prefix = name.substring(0, 3).toUpperCase() || "REK";
        let isUnique = false;
        let code = "";

        while (!isUnique) {
            const random = crypto.randomBytes(2).toString("hex").toUpperCase();
            code = `${prefix}-${random}`;

            const existing = await prisma.reseller.findUnique({
                where: { referral_code: code }
            });

            if (!existing) isUnique = true;
        }

        return code;
    }

    /**
     * Phase 2: Establish a permanent mapping between a vendor and reseller.
     * Once linked, we build the "Locked" safety.
     */
    static async mapVendorToReseller(workspaceId: string, referralCode: string) {
        const { FraudDetectionEngine } = require("./fraud");

        // 1. Validate Mapping Lock (Prevents Reseller Hopping)
        await FraudDetectionEngine.validateMappingLock(workspaceId, referralCode);

        const reseller = await prisma.reseller.findUnique({
            where: { referral_code: referralCode, status: "ACTIVE" }
        });

        if (!reseller) return null;

        return await prisma.$transaction(async (tx) => {
            // Create permanent map
            const map = await tx.resellerVendorMap.upsert({
                where: { workspace_id: workspaceId },
                update: {
                    reseller_id: reseller.id,
                    referral_source: referralCode
                },
                create: {
                    reseller_id: reseller.id,
                    workspace_id: workspaceId,
                    referral_source: referralCode,
                    is_permanent: true
                }
            });

            // Update Workspace for quick access
            await tx.workspace.update({
                where: { id: workspaceId },
                data: { reseller_id: reseller.id }
            });

            // --- PHASE 4: AUTO-UPGRADE ---
            await ResellerService.evaluateResellerTier(reseller.id, tx);

            // --- PHASE 7: FRAUD DETECTION ---
            await FraudDetectionEngine.evaluateVendorRisk(reseller.id, workspaceId, tx);

            return map;
        });
    }

    /**
     * PHASE 4: TIER AUTO-UPGRADE LOGIC
     * Evaluates reseller performance and upgrades tier if thresholds are met.
     */
    static async evaluateResellerTier(resellerId: string, tx: any) {
        // 1. Get current reseller with active mapping count
        const reseller = await tx.reseller.findUnique({
            where: { id: resellerId },
            include: {
                tier: true,
                _count: {
                    select: { vendor_mappings: true }
                }
            }
        });

        if (!reseller) return;

        const activeVendors = reseller._count.vendor_mappings;

        // 2. Find the best qualifying tier
        const qualifyingTier = await tx.resellerTier.findFirst({
            where: {
                min_vendors: { lte: activeVendors }
            },
            orderBy: {
                min_vendors: 'desc'
            }
        });

        // 3. Upgrade if better tier found
        if (qualifyingTier && (!reseller.tier || qualifyingTier.min_vendors > reseller.tier.min_vendors)) {
            await tx.reseller.update({
                where: { id: resellerId },
                data: {
                    tier_id: qualifyingTier.id
                }
            });
            console.log(`🚀 [Reseller Engine] Tier Upgraded: ${reseller.name} is now ${qualifyingTier.name}`);
        }
    }

    /**
     * Utility to seed standard tiers if they don't exist.
     */
    static async seedInitialTiers() {
        const tiers = [
            { name: "Starter", min_vendors: 0, commission_rate: 20 },
            { name: "Growth", min_vendors: 10, commission_rate: 25 },
            { name: "Empire", min_vendors: 50, commission_rate: 30 },
            { name: "Legend", min_vendors: 100, commission_rate: 35 },
        ];

        for (const tier of tiers) {
            await prisma.resellerTier.upsert({
                where: { name: tier.name },
                update: {},
                create: tier
            });
        }
    }

    /**
     * PHASE 3 & 5: COMMISSION ENGINE + AUTOMATED LEDGER
     */
    static async processPaymentCommission(tx: any, workspaceId: string, amount: number, transactionId: string) {
        const { ResellerFinanceEngine } = require("./finance-engine");

        const workspace = await tx.workspace.findUnique({
            where: { id: workspaceId },
            include: { reseller: { include: { tier: true } } }
        });

        if (!workspace?.reseller || workspace.reseller.status !== "ACTIVE" || workspace.reseller.is_frozen) {
            return;
        }

        const reseller = workspace.reseller;
        const rate = reseller.tier?.commission_rate ? Number(reseller.tier.commission_rate) : Number(reseller.base_commission);
        const commission = (amount * rate) / 100;

        await ResellerFinanceEngine.recordTransaction(tx, {
            resellerId: reseller.id,
            workspaceId: workspaceId,
            amount: commission,
            type: "COMMISSION",
            description: `Commission for Payment ${transactionId}`,
            referenceId: transactionId
        });
    }

    /**
     * REVERSE COMMISSION (Module 1/3)
     * Reverses previous commission when a vendor's payment is refunded.
     */
    static async reversePaymentCommission(tx: any, originalTransactionId: string) {
        const { ResellerFinanceEngine } = require("./finance-engine");

        // 1. Find previous commission
        const entry = await tx.resellerLedger.findFirst({
            where: { reference_id: originalTransactionId, type: "COMMISSION" }
        });

        if (!entry) return;

        // 2. Debit reseller for the same amount
        await ResellerFinanceEngine.recordTransaction(tx, {
            resellerId: entry.reseller_id,
            workspaceId: entry.workspace_id,
            amount: -Number(entry.amount),
            type: "REFUND_REVERSAL",
            description: `Reversal for Refunded Payment ${originalTransactionId}`,
            referenceId: `REV-${originalTransactionId}`
        });
    }

    /**
     * CREDIT SYSTEM PHASE 5: USAGE COMMISSION
     */
    static async processUsageCommission(tx: any, workspaceId: string, totalDeducted: number, messageId: string) {
        const { ResellerFinanceEngine } = require("./finance-engine");

        const workspace = await tx.workspace.findUnique({
            where: { id: workspaceId },
            include: { reseller: { include: { tier: true } } }
        });

        if (!workspace?.reseller || workspace.reseller.status !== "ACTIVE" || workspace.reseller.is_frozen) {
            return;
        }

        const reseller = workspace.reseller;
        const rate = reseller.tier?.commission_rate ? Number(reseller.tier.commission_rate) : Number(reseller.base_commission);
        const markupPct = Number(reseller.markup_percentage) || 0;

        const basePrice = totalDeducted / (1 + (markupPct / 100));
        const commissionOnBase = (basePrice * rate) / 100;
        const markupProfit = totalDeducted - basePrice;
        const totalCommission = commissionOnBase + markupProfit;

        await ResellerFinanceEngine.recordTransaction(tx, {
            resellerId: reseller.id,
            workspaceId: workspaceId,
            amount: totalCommission,
            type: "COMMISSION",
            description: `Usage Commission: ${messageId}`,
            referenceId: messageId
        });
    }

    /**
     * PHASE 6: PAYOUT REQUEST
     * Allows a reseller to request a payout if they hit the threshold.
     */
    static async requestPayout(resellerId: string, amount: number, paymentDetails: any) {
        const { FINANCIAL_RULES } = require("./config");

        return await prisma.$transaction(async (tx) => {
            const reseller = await tx.reseller.findUnique({
                where: { id: resellerId }
            });

            if (!reseller) throw new Error("Reseller not found");
            if (reseller.status !== "ACTIVE") throw new Error("Account is not active");

            // --- PHASE 7: FRAUD GUARD ---
            const { FraudDetectionEngine } = require("./fraud");
            await FraudDetectionEngine.validatePayoutEligibility(resellerId);

            // 1. Balance Check
            if (Number(reseller.wallet_balance) < amount) {
                throw new Error("Insufficient wallet balance");
            }

            // 2. Threshold Check
            if (amount < FINANCIAL_RULES.MINIMUM_PAYOUT_AMOUNT) {
                throw new Error(`Minimum payout amount is ${FINANCIAL_RULES.MINIMUM_PAYOUT_AMOUNT}`);
            }

            // 3. Create Request
            const request = await tx.resellerPayoutRequest.create({
                data: {
                    reseller_id: resellerId,
                    amount: amount,
                    status: "PENDING",
                    payment_details: paymentDetails
                }
            });

            // Note: We don't deduct balance until APPROVED and PAID.
            return request;
        });
    }

    /**
     * PHASE 6: ADMIN PAYOUT APPROVAL
     * Final step: Marks as PAID, debits wallet, and logs to ledger.
     */
    static async processAdminPayoutAction(requestId: string, action: 'APPROVE' | 'REJECT', adminNotes?: string) {
        return await prisma.$transaction(async (tx) => {
            const request = await tx.resellerPayoutRequest.findUnique({
                where: { id: requestId },
                include: { reseller: true }
            });

            if (!request || request.status !== "PENDING") {
                throw new Error("Request not found or already processed");
            }

            if (action === 'REJECT') {
                return await tx.resellerPayoutRequest.update({
                    where: { id: requestId },
                    data: { status: "REJECTED", admin_notes: adminNotes }
                });
            }

            // --- APPROVE & PAY ---
            const amount = Number(request.amount);
            const reseller = request.reseller;

            if (Number(reseller.wallet_balance) < amount) {
                throw new Error("Reseller balance insufficient at time of approval");
            }

            // 1. Debit Wallet
            const updatedReseller = await tx.reseller.update({
                where: { id: reseller.id },
                data: {
                    wallet_balance: { decrement: amount }
                }
            });

            // 2. Update Request Status
            await tx.resellerPayoutRequest.update({
                where: { id: requestId },
                data: {
                    status: "PAID",
                    admin_notes: adminNotes,
                    processed_at: new Date()
                }
            });

            // 3. Create Ledger Entry (Safety & Audit)
            await tx.resellerLedger.create({
                data: {
                    reseller_id: reseller.id,
                    amount: -amount, // Negative for payout
                    type: "PAYOUT",
                    description: `Payout Success: ${requestId}`,
                    reference_id: requestId,
                    balance_after: Number(updatedReseller.wallet_balance)
                }
            });

            return { success: true, balance: updatedReseller.wallet_balance };
        });
    }
}
