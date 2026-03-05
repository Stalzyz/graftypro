import { prisma } from "../db";
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
     * Supports both direct referral codes and coupon-based attribution.
     */
    static async mapVendorToReseller(workspaceId: string, referralCode?: string, couponCode?: string) {
        const { FraudDetectionEngine } = require("./fraud");

        return await prisma.$transaction(async (tx) => {
            let resellerId: string | null = null;
            let referralSource: string | null = null;
            let couponId: string | null = null;

            // 1. Resolve via Referral Code (Primary)
            if (referralCode) {
                const reseller = await tx.reseller.findUnique({
                    where: { referral_code: referralCode, status: "ACTIVE" }
                });
                if (reseller) {
                    resellerId = reseller.id;
                    referralSource = referralCode;
                }
            }

            // 2. Resolve via Coupon Code (Secondary, with incentive) - ATOMIC LOCK
            if (couponCode) {
                const coupon = await tx.resellerCoupon.findUnique({
                    where: { code: couponCode.toUpperCase(), is_active: true }
                });

                if (coupon) {
                    // Lock the coupon for usage check
                    await tx.$queryRaw`SELECT id FROM reseller_coupons WHERE id = ${coupon.id} FOR UPDATE`;
                    const reseller = await tx.reseller.findUnique({ where: { id: coupon.reseller_id } });

                    if (reseller && reseller.status === "ACTIVE") {
                        if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
                            throw new Error("Coupon usage limit reached.");
                        } else if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
                            throw new Error("Coupon has expired.");
                        } else {
                            resellerId = coupon.reseller_id;
                            referralSource = `COUPON:${coupon.code}`;
                            couponId = coupon.id;
                        }
                    }
                }
            }

            if (!resellerId) throw new Error("Referral or Coupon invalid.");

            // 3. Validate Mapping Lock (Inside TX is better but already has upsert below)
            // Still calling it to ensure business rules
            await FraudDetectionEngine.validateMappingLock(workspaceId, referralCode || couponCode || "");

            // A. Create permanent mapping record
            const map = await tx.resellerVendorMap.upsert({
                where: { workspace_id: workspaceId },
                update: {
                    reseller_id: resellerId!,
                    referral_source: referralSource
                },
                create: {
                    reseller_id: resellerId!,
                    workspace_id: workspaceId,
                    referral_source: referralSource,
                    is_permanent: true
                }
            });

            // B. Secure Workspace relation
            await tx.workspace.update({
                where: { id: workspaceId },
                data: {
                    reseller_id: resellerId,
                    coupon_id: couponId
                }
            });

            // C. Atomically increment coupon usage
            if (couponId) {
                await tx.resellerCoupon.update({
                    where: { id: couponId },
                    data: { usage_count: { increment: 1 } }
                });
            }

            // --- PHASE 4: AUTO-UPGRADE ---
            await ResellerService.evaluateResellerTier(resellerId!, tx);

            // --- PHASE 7: FRAUD DETECTION ---
            await FraudDetectionEngine.evaluateVendorRisk(resellerId!, workspaceId, tx);

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
     * PHASE 3, 5 & 6: ADVANCED HYBRID REVENUE SHARING ENGINE
     * Implements Multi-Step Split: Base Cost -> Profit Share -> Margin Control
     */
    static async processPaymentCommission(tx: any, workspaceId: string, amount: number, transactionId: string) {
        const { ResellerFinanceEngine } = require("./finance-engine");

        // 1. Load System & Workspace Configuration
        const [workspace, config] = await Promise.all([
            tx.workspace.findUnique({
                where: { id: workspaceId },
                include: {
                    reseller: { include: { tier: true } },
                    plan_details: true
                }
            }),
            tx.systemConfig.findUnique({ where: { id: "global" } })
        ]);

        if (!workspace?.reseller || workspace.reseller.status !== "ACTIVE" || workspace.reseller.is_frozen) {
            console.log(`[Revenue Engine] Payment ${transactionId}: No active/valid reseller mapping.`);
            return;
        }

        const reseller = workspace.reseller;

        // 2. Define Economics (Dynamic from config or plan)
        const basePlatformCost = Number(workspace.plan_details?.min_reseller_price || config?.rev_base_platform_cost || 2000);
        const paidAmount = Number(amount);

        // 3. Split Calculation (Margin Protection)
        const partnerProfit = paidAmount - basePlatformCost;

        if (partnerProfit <= 0) {
            console.warn(`[Revenue Engine] Payment ${transactionId}: Margin too low (Paid: ₹${paidAmount}, Base: ₹${basePlatformCost}). Split skipped.`);
            // Optional: Log this as a conflict for Super Admin
            return;
        }

        // 4. ATOMIC LEDGER DISTRIBUTION
        // We log both parts for full audit transparency

        // 4a. Base Cost Split (Platform Revenue)
        await ResellerFinanceEngine.recordTransaction(tx, {
            resellerId: reseller.id,
            workspaceId: workspaceId,
            amount: -basePlatformCost, // Shown as cost in partner ledger context if needed, or separate entry
            type: "BASE_COST_SPLIT",
            description: `Base Platform Cost: Transaction ${transactionId}`,
            referenceId: transactionId
        });

        // 4b. Partner Profit Share (Liquid Credit)
        await ResellerFinanceEngine.recordTransaction(tx, {
            resellerId: reseller.id,
            workspaceId: workspaceId,
            amount: partnerProfit,
            type: "PROFIT_SHARE",
            description: `Partner Profit Share: Transaction ${transactionId}`,
            referenceId: transactionId
        });

        // 5. Update Monthly Growth Stats (For Tier Bonus eligibility)
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();

        await tx.resellerMonthlyStats.upsert({
            where: {
                reseller_id_month_year: {
                    reseller_id: reseller.id,
                    month,
                    year
                }
            },
            update: {
                total_revenue: { increment: paidAmount },
                net_profit: { increment: partnerProfit }
            },
            create: {
                reseller_id: reseller.id,
                month,
                year,
                total_revenue: paidAmount,
                net_profit: partnerProfit
            }
        });

        console.log(`✅ [Revenue Engine] Split Finalized: Profit ₹${partnerProfit} | Base ₹${basePlatformCost}`);
    }

    /**
     * PHASE 7: MONTHLY TIER BONUS CALCULATION ENGINE
     * Automatically calculates and credits bonuses based on monthly performance thresholds.
     */
    static async calculateMonthEndBonuses(month: number, year: number) {
        const { ResellerFinanceEngine } = require("./finance-engine");

        return await prisma.$transaction(async (tx) => {
            // 1. Load System Thresholds
            const config = await tx.systemConfig.findUnique({ where: { id: "global" } });
            if (!config || !config.rev_enable_tier_bonus) return { skipped: true };

            // 2. Fetch all monthly stats for the period that aren't locked
            const stats = await tx.resellerMonthlyStats.findMany({
                where: { month, year, is_locked: false },
                include: { reseller: { include: { tier: true } } }
            });

            const results = [];

            for (const stat of stats) {
                const totalRevenue = Number(stat.total_revenue);
                const netProfit = Number(stat.net_profit);

                let bonusPct = 0;
                let tierName = "None";

                // Threshold Check (Highest tier first)
                if (totalRevenue >= Number(config.rev_tier_threshold_2)) {
                    bonusPct = Number(config.rev_tier_bonus_2);
                    tierName = "Empire";
                } else if (totalRevenue >= Number(config.rev_tier_threshold_1)) {
                    bonusPct = Number(config.rev_tier_bonus_1);
                    tierName = "Growth";
                }

                if (bonusPct > 0) {
                    const bonusAmount = (netProfit * bonusPct) / 100;

                    // A. Credit Wallet via Ledger
                    await ResellerFinanceEngine.recordTransaction(tx, {
                        resellerId: stat.reseller_id,
                        amount: bonusAmount,
                        type: "TIER_BONUS",
                        description: `Monthly Tier Bonus: ${tierName} (${bonusPct}%) for ${month}/${year}`,
                        referenceId: `BONUS-${stat.reseller_id}-${month}-${year}`
                    });

                    // B. Mark Stats as Processed/Locked
                    await tx.resellerMonthlyStats.update({
                        where: { id: stat.id },
                        data: {
                            bonus_earned: bonusAmount,
                            is_locked: true,
                            processed_at: new Date()
                        }
                    });

                    results.push({ resellerId: stat.reseller_id, bonus: bonusAmount });
                } else {
                    // Lock even if no bonus to prevent dual processing
                    await tx.resellerMonthlyStats.update({
                        where: { id: stat.id },
                        data: { is_locked: true, processed_at: new Date() }
                    });
                }
            }

            return { processed: stats.length, bonusesClaimed: results.length, data: results };
        });
    }

    /**
     * REVERSE COMMISSION (Module 1/3)
     * Reverses previous commission when a vendor's payment is refunded.
     */
    static async reversePaymentCommission(tx: any, originalTransactionId: string) {
        const { ResellerFinanceEngine } = require("./finance-engine");

        // 1. Find previous entries (Both Profit Share and Base Cost Split if we want to reverse everything)
        const entries = await tx.resellerLedger.findMany({
            where: { reference_id: originalTransactionId }
        });

        if (!entries.length) return;

        for (const entry of entries) {
            // 2. Debit reseller for the same amount (reversal)
            await ResellerFinanceEngine.recordTransaction(tx, {
                resellerId: entry.reseller_id,
                workspaceId: entry.workspace_id,
                amount: -Number(entry.amount),
                type: "REFUND_REVERSAL",
                description: `Reversal for Refunded Transaction ${originalTransactionId} (${entry.type})`,
                referenceId: `REV-${originalTransactionId}-${entry.type}`
            });
        }

        // 3. Update Monthly Stats (Decrement Revenue)
        const firstEntry = entries[0];
        const now = new Date();
        await tx.resellerMonthlyStats.updateMany({
            where: {
                reseller_id: firstEntry.reseller_id,
                month: now.getMonth() + 1,
                year: now.getFullYear(),
                is_locked: false
            },
            data: {
                total_revenue: { decrement: entries.reduce((acc: number, e: any) => acc + (Number(e.amount) > 0 ? Number(e.amount) : 0), 0) },
                net_profit: { decrement: entries.reduce((acc: number, e: any) => acc + (Number(e.amount) > 0 ? Number(e.amount) : 0), 0) }
            }
        });
    }

    /**
     * ADVANCED WALLET MARGIN ENGINE (Phase 5)
     * Splits usage charges based on Meta Cost + Platform Margin + WL Margin
     */
    static async processUsageCommission(tx: any, workspaceId: string, totalDeducted: number, messageId: string) {
        const { ResellerFinanceEngine } = require("./finance-engine");

        // 1. Fetch Economics
        const [workspace, config] = await Promise.all([
            tx.workspace.findUnique({
                where: { id: workspaceId },
                include: { reseller: { include: { tier: true } } }
            }),
            tx.systemConfig.findUnique({ where: { id: "global" } })
        ]);

        if (!workspace?.reseller || workspace.reseller.status !== "ACTIVE" || workspace.reseller.is_frozen) {
            return;
        }

        if (!config?.rev_enable_wallet_margin) return;

        const reseller = workspace.reseller;

        // 2. Logic: Allocation of White-label Margin
        // The master platform charges the vendor: Meta + Platform + WLMargin
        // We now allocate the WLMargin to the partner's wallet.

        let wlMargin = 0;

        if (Number(reseller.markup_percentage) > 0) {
            // FIXED CALCULATION (Phase 3 Audit):
            // totalDeducted = BasePrice * (1 + markup/100)
            // Therefore: BasePrice = totalDeducted / (1 + markup/100)
            // Margin = totalDeducted - BasePrice

            const markupFactor = 1 + (Number(reseller.markup_percentage) / 100);
            const basePrice = totalDeducted / markupFactor;
            wlMargin = totalDeducted - basePrice;
        } else {
            // Fallback to fixed config margin if no percentage set
            wlMargin = config.rev_default_wallet_margin || 0.15;
        }

        // Safety: Ensure we don't pay out more than the amount (impossible via math above, but good practice)
        if (wlMargin >= totalDeducted) {
            console.error(`[Revenue Engine] Critical: Calculated margin ${wlMargin} >= total ${totalDeducted}. Capping.`);
            wlMargin = totalDeducted * 0.5; // Emergency cap
        }

        if (wlMargin <= 0) return;

        // 3. Update Partner Balance
        await ResellerFinanceEngine.recordTransaction(tx, {
            resellerId: reseller.id,
            workspaceId: workspaceId,
            amount: wlMargin,
            type: "WALLET_MARGIN",
            description: `Credit Usage Margin: ${messageId}`,
            referenceId: `USAGE-${messageId}`
        });

        // 4. Track Volume in Monthly Stats
        const now = new Date();
        await tx.resellerMonthlyStats.upsert({
            where: {
                reseller_id_month_year: {
                    reseller_id: reseller.id,
                    month: now.getMonth() + 1,
                    year: now.getFullYear()
                }
            },
            update: {
                total_revenue: { increment: totalDeducted },
                net_profit: { increment: wlMargin }
            },
            create: {
                reseller_id: reseller.id,
                month: now.getMonth() + 1,
                year: now.getFullYear(),
                total_revenue: totalDeducted,
                net_profit: wlMargin
            }
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

            // 1. Atomic Balance & Pending Check
            // Lock the reseller to prevent concurrent requests bypassing balance check
            await tx.$queryRaw`SELECT id FROM resellers WHERE id = ${resellerId} FOR UPDATE`;

            const pendingTotalRes = await tx.resellerPayoutRequest.aggregate({
                where: { reseller_id: resellerId, status: "PENDING" },
                _sum: { amount: true }
            });
            const pendingTotal = Number(pendingTotalRes._sum.amount || 0);
            const availableBalance = Number(reseller.wallet_balance) - pendingTotal;

            if (availableBalance < amount) {
                throw new Error(`Insufficient available balance. You have ₹${pendingTotal} in pending payouts.`);
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
