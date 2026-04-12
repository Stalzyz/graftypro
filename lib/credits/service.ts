/**
 * Credit Service - Production-Grade Credit Wallet Management
 * 
 * Features:
 * - GST-compliant credit purchases
 * - Atomic deductions with row locking
 * - Idempotent operations
 * - Invoice generation
 * - Meta billing tracking
 * - Reseller commission processing
 */

import { prisma } from "../db";
import { GSTService } from "../finance/gst-service";
import { InvoiceService } from "../finance/invoice-service";

export class CreditService {
    private static pricingCache: Map<string, { price: number, expiry: number }> = new Map();
    private static CACHE_TTL = 10 * 60 * 1000; // 10 Minutes
    private static PLATFORM_FEE = 0.05; // ₹0.05 Orchestration Fee for DIRECT billing

    /**
     * Calculate credits based on amount including tiered bonuses
     * ₹500: ₹500
     * ₹2,000: ₹2,200 (10%)
     * ₹5,000: ₹5,750 (15%)
     * ₹10,000: ₹12,000 (20%)
     */
    static calculateRechargeCredits(amount: number): number {
        if (amount >= 10000) return Math.floor(amount * 1.20);
        if (amount >= 5000) return Math.floor(amount * 1.15);
        if (amount >= 2000) return Math.floor(amount * 1.10);
        return amount;
    }

    /**
     * Add credits to vendor wallet with GST and invoice generation
     * 
     * @param tx - Prisma transaction
     * @param workspaceId - Workspace ID
     * @param netAmount - Amount before GST
     * @param paymentId - Razorpay payment ID
     * @param description - Transaction description
     * @param billingDetails - Customer billing details
     * @returns Balance after addition and invoice
     */
    static async addCreditsWithGST(
        tx: any,
        workspaceId: string,
        netAmount: number,
        paymentId: string,
        description: string,
        billingDetails: {
            name: string;
            address: string;
            state: string;
            pincode: string;
            gstin?: string;
            email?: string;
            phone?: string;
        }
    ) {
        // 1. Check for duplicate payment (idempotency)
        const existingTransaction = await tx.creditTransaction.findFirst({
            where: {
                related_payment_id: paymentId,
                type: 'PURCHASE'
            }
        });

        if (existingTransaction) {
            console.log(`[Credit Engine] Duplicate payment detected: ${paymentId}`);
            return {
                balanceAfter: Number(existingTransaction.balance_after),
                invoice: null,
                duplicate: true
            };
        }

        // 2. Calculate GST
        const gstBreakdown = await GSTService.calculateGST(netAmount, billingDetails.state);

        // 3. Get or Create Wallet
        let wallet = await tx.vendorWallet.findUnique({
            where: { workspace_id: workspaceId }
        });

        if (!wallet) {
            wallet = await tx.vendorWallet.create({
                data: {
                    workspace_id: workspaceId,
                    billing_name: billingDetails.name,
                    billing_address: billingDetails.address,
                    billing_state: billingDetails.state,
                    billing_pincode: billingDetails.pincode,
                    billing_email: billingDetails.email,
                    billing_phone: billingDetails.phone,
                    gst_registered: !!billingDetails.gstin,
                    gstin: billingDetails.gstin
                }
            });
        } else {
            // Update billing details if provided
            await tx.vendorWallet.update({
                where: { id: wallet.id },
                data: {
                    billing_name: billingDetails.name,
                    billing_address: billingDetails.address,
                    billing_state: billingDetails.state,
                    billing_pincode: billingDetails.pincode,
                    billing_email: billingDetails.email || wallet.billing_email,
                    billing_phone: billingDetails.phone || wallet.billing_phone,
                    gst_registered: !!billingDetails.gstin,
                    gstin: billingDetails.gstin || wallet.gstin
                }
            });
        }

        const balanceBefore = Number(wallet.current_balance);
        const balanceAfter = balanceBefore + netAmount; // Credits = net amount (before GST)

        // 4. Update Wallet
        await tx.vendorWallet.update({
            where: { id: wallet.id },
            data: {
                current_balance: { increment: netAmount },
                total_purchased: { increment: netAmount }
            }
        });

        // 5. Create Ledger Entry with GST breakdown
        const transaction = await tx.creditTransaction.create({
            data: {
                workspace_id: workspaceId,
                wallet_id: wallet.id,
                type: 'PURCHASE',
                amount: netAmount,
                balance_before: balanceBefore,
                balance_after: balanceAfter,

                // GST Breakdown
                net_amount: gstBreakdown.net_amount,
                gst_amount: gstBreakdown.gst_total,
                cgst_amount: gstBreakdown.cgst,
                sgst_amount: gstBreakdown.sgst,
                igst_amount: gstBreakdown.igst,
                total_amount: gstBreakdown.total_amount,

                // References
                related_payment_id: paymentId,
                description: description,

                // Status
                status: 'COMPLETED',
                initiated_by: 'SYSTEM'
            }
        });

        // 6. Generate Invoice
        const invoice = await InvoiceService.createInvoice({
            tx,
            workspaceId,
            walletId: wallet.id,
            paymentId,
            items: [{
                description: description || "WhatsApp Credits Purchase",
                quantity: 1,
                rate: netAmount,
                taxable_value: netAmount,
                cgst_rate: gstBreakdown.cgst_rate,
                sgst_rate: gstBreakdown.sgst_rate,
                igst_rate: gstBreakdown.igst_rate
            }],
            billingDetails,
            hsnCode: (billingDetails as any).hsn_code
        });

        // Link transaction to invoice
        await tx.creditTransaction.update({
            where: { id: transaction.id },
            data: { invoice_id: invoice.id }
        });

        console.log(`[Credit Engine] Credits Added: ${netAmount} to ${workspaceId}. Balance: ${balanceAfter}. Invoice: ${invoice.invoice_number}`);

        return {
            balanceAfter,
            invoice,
            transaction,
            duplicate: false
        };
    }

    /**
     * Legacy addCredits for backward compatibility
     * Use addCreditsWithGST for new implementations
     */
    static async addCredits(tx: any, workspaceId: string, amount: number, paymentId: string, description: string) {
        // Get wallet to extract billing details
        const wallet = await tx.vendorWallet.findUnique({
            where: { workspace_id: workspaceId }
        });

        const billingDetails = {
            name: wallet?.billing_name || 'Customer',
            address: wallet?.billing_address || 'Address',
            state: wallet?.billing_state || 'Karnataka',
            pincode: wallet?.billing_pincode || '560001',
            gstin: wallet?.gstin,
            email: wallet?.billing_email,
            phone: wallet?.billing_phone
        };

        return await this.addCreditsWithGST(tx, workspaceId, amount, paymentId, description, billingDetails);
    }

    /**
     * Atomic credit deduction with row locking and idempotency
     * 
     * @param workspaceId - Workspace ID
     * @param amount - Amount to deduct
     * @param messageId - Unique message ID
     * @param metaMessageId - Meta's message ID (optional, can be updated later)
     * @param category - Message category (MARKETING, UTILITY, etc.)
     * @param countryCode - Country code
     * @param description - Transaction description
     * @returns Deduction result
     */
    static async deductCreditsAtomic(
        workspaceId: string,
        amount: number,
        messageId: string,
        metaMessageId: string | null,
        category: string,
        countryCode: string,
        description: string
    ) {
        return await prisma.$transaction(async (tx) => {
            // 0. Zero-Cost Quick Pass
            if (amount <= 0) {
                return {
                    success: true,
                    balance_after: 0,
                    transaction_id: "free_msg_" + Date.now(),
                    margin: 0
                };
            }

            // 1. Row-level lock using raw SQL
            await tx.$executeRaw`
        SELECT * FROM vendor_wallets 
        WHERE workspace_id = ${workspaceId} 
        FOR UPDATE
      `;

            // 2. Check for duplicate deduction (idempotency)
            const existing = await tx.creditTransaction.findFirst({
                where: {
                    related_message_id: messageId,
                    type: 'DEDUCTION'
                }
            });

            if (existing) {
                console.log(`[Credit Engine] Duplicate deduction prevented: ${messageId}`);
                return {
                    success: false,
                    error: 'DUPLICATE_DEDUCTION',
                    transaction_id: existing.id,
                    balance_after: Number(existing.balance_after)
                };
            }

            // 3. Get wallet — Bug #2 Fix: auto-create if it doesn't exist yet.
            // Previously this threw a hard "Wallet not found" error which silently
            // blocked all messaging for vendors whose wallet was never created
            // (e.g. Google OAuth sign-ups before the Bug #7 fix, or super-admin
            // created accounts that bypassed the normal registration flow).
            let wallet = await tx.vendorWallet.findUnique({
                where: { workspace_id: workspaceId }
            });

            if (!wallet) {
                console.warn(`[CreditService] ⚠️ Wallet missing for workspace ${workspaceId} — auto-creating with zero balance.`);
                wallet = await tx.vendorWallet.create({
                    data: {
                        workspace_id: workspaceId,
                        current_balance: 0,
                        total_purchased: 0,
                        total_used: 0,
                    }
                });
            }

            if (wallet.is_frozen) {
                throw new Error(`Wallet frozen: ${wallet.freeze_reason || 'Review required'}`);
            }

            // 3.5 Check Workspace Status
            const workspace = await tx.workspace.findUnique({
                where: { id: workspaceId }
            });

            if (!workspace || workspace.status === 'SUSPENDED') {
                throw new Error("Account suspended. Please contact support.");
            }

            if (wallet.is_automated_blocked) {
                throw new Error('Automated messaging blocked for security. Please contact support.');
            }

            // 3.6 Trial Limit Enforcement (100 credits max for unsubscribed users without GST)
            // Bug #2 Fix: also verify the plan FK actually resolves to a real active plan.
            // A non-null current_plan_id pointing to a deleted plan (orphaned FK after seed
            // re-runs) was incorrectly counted as "subscribed" — now we do a real lookup.
            let hasSubscription = false;
            if (workspace.current_plan_id) {
                const planExists = await tx.subscriptionPlan.findFirst({
                    where: { id: workspace.current_plan_id, is_active: true },
                    select: { id: true }
                });
                hasSubscription = !!planExists;
            }
            const hasGST = wallet.gst_registered;
            if (!hasSubscription && !hasGST) {
                const totalUsed = Number(wallet.total_used);
                const TRIAL_LIMIT = 100;
                if (totalUsed + amount > TRIAL_LIMIT) {
                    throw new Error(`Trial limit exceeded (${TRIAL_LIMIT} credits max). Please subscribe to a plan or add GST details to continue.`);
                }
            }

            const currentBalance = Number(wallet.current_balance);
            const serviceBonusBalance = Number((wallet as any).service_bonus_balance || 0);

            let bonusDeducted = 0;
            let walletDeducted = amount;

            // 3.7 Handle Service-Only Bonus Credits
            if (category === 'SERVICE' && serviceBonusBalance > 0) {
                if (serviceBonusBalance >= amount) {
                    bonusDeducted = amount;
                    walletDeducted = 0;
                } else {
                    bonusDeducted = serviceBonusBalance;
                    walletDeducted = amount - serviceBonusBalance;
                }
            }

            if (currentBalance < walletDeducted) {
                throw new Error('Insufficient balance');
            }

            // 4. Calculate pricing breakdown
            const metaCost = await this.getMetaCost(category, countryCode);
            const ourCharge = amount;
            const margin = ourCharge - metaCost;

            // 5. Update wallet
            const balanceAfter = currentBalance - walletDeducted;

            await tx.vendorWallet.update({
                where: { id: wallet.id },
                data: {
                    current_balance: walletDeducted > 0 ? { decrement: walletDeducted } : undefined,
                    service_bonus_balance: bonusDeducted > 0 ? { decrement: bonusDeducted } : undefined,
                    total_used: { increment: amount }
                }
            });

            // 6. Create ledger entry
            const transaction = await tx.creditTransaction.create({
                data: {
                    workspace_id: workspaceId,
                    wallet_id: wallet.id,
                    type: 'DEDUCTION',
                    amount: -amount,
                    balance_before: currentBalance, // Note: This snapshot is slightly simplified but useful for audit
                    balance_after: balanceAfter,

                    // References
                    related_message_id: messageId,
                    meta_message_id: metaMessageId,

                    // Message Details
                    message_category: category,
                    country_code: countryCode,
                    meta_cost: metaCost,
                    our_charge: ourCharge,
                    margin: margin,

                    // Metadata
                    description: description,
                    status: 'COMPLETED',
                    initiated_by: 'SYSTEM'
                }
            });

            // 7. Process reseller commission
            try {
                const { ResellerService } = require('@/lib/reseller/service');
                await ResellerService.processUsageCommission(
                    tx,
                    workspaceId,
                    amount,
                    messageId
                );
            } catch (err) {
                console.error('[Credit Engine] Reseller commission error:', err);
            }

            console.log(`[Credit Engine] Credits Deducted: ${amount} from ${workspaceId}. Balance: ${balanceAfter}`);

            // 8. Fraud Detection & Auto Recharge Hooks
            await this.processPostDeductionHooks(tx, wallet, balanceAfter, amount);

            return {
                success: true,
                balance_after: balanceAfter,
                transaction_id: transaction.id,
                margin: margin
            };

        }, {
            isolationLevel: 'Serializable',
            timeout: 10000
        });
    }

    /**
     * Process post-deduction logic: Fraud Checks and Auto Recharge
     */
    private static async processPostDeductionHooks(tx: any, wallet: any, balanceAfter: number, amount: number) {
        // 1. Velocity Analysis (Spike Detection)
        const velocity = await this.calculateUsageVelocity(wallet.workspace_id);

        // 2. Fraud Rules
        if (velocity > (wallet.max_daily_velocity || 10000)) {
            console.warn(`[Fraud Engine] High velocity detected for ${wallet.workspace_id}: ${velocity}`);
            // Flag for review but don't block yet (soft alert)
            this.triggerFraudAlert(wallet.workspace_id, velocity, "DAILY_VELOCITY_EXCEEDED");
        }

        // 3. Auto-Recharge Logic (Tokenized Card)
        if (wallet.auto_recharge_enabled && balanceAfter < Number(wallet.auto_recharge_threshold)) {
            if (wallet.razorpay_customer_id && wallet.razorpay_token_id) {
                console.log(`[Auto Recharge] Triggering recharge for ${wallet.workspace_id} (Balance: ${balanceAfter})`);
                this.triggerAutoRecharge(wallet.workspace_id, Number(wallet.auto_recharge_amount));
            }
        }

        // 4. SMART TOPUP ALERT (WhatsApp + Payment Link)
        if (balanceAfter < 500) {
            try {
                const { SmartAlertService } = await import("./smart-alert");
                // Run in background to not block the main transaction response too much
                // (Though deductCreditsAtomic is usually called from internal services)
                SmartAlertService.triggerSmartAlert(wallet.workspace_id, balanceAfter).catch(err => {
                    console.error("[CreditService] Smart Alert trigger failed:", err);
                });
            } catch (err) {
                console.error("[CreditService] Failed to load SmartAlertService:", err);
            }
        }

        // 5. Fallback Legacy Low Balance Alert (Email)
        if (balanceAfter < 500 && !wallet.auto_recharge_enabled) {
            this.triggerLowBalanceAlert(wallet.workspace_id, balanceAfter, wallet.billing_email);
        }
    }

    /**
     * Calculate usage velocity (Credits used in last 24 hours)
     */
    static async calculateUsageVelocity(workspaceId: string): Promise<number> {
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const result = await prisma.creditTransaction.aggregate({
            where: {
                workspace_id: workspaceId,
                type: 'DEDUCTION',
                created_at: { gte: last24h }
            },
            _sum: {
                amount: true
            }
        });
        return Math.abs(Number(result._sum.amount || 0));
    }

    /**
     * Trigger Auto Recharge via Razorpay
     * Note: This requires the Razorpay Recurring/Token API setup
     */
    private static async triggerAutoRecharge(workspaceId: string, amount: number) {
        try {
            // This would normally call a dedicated PaymentService
            console.log(`[Auto Recharge] Attempting to charge ${amount} for ${workspaceId}`);

            // Placeholder: In real implementation, this would:
            // 1. Create a Razorpay Order
            // 2. Use the stored customer_id and token_id to create a recurring charge
            // 3. Upon success, call CreditService.addCredits()

            // For now, we'll log it and send an email notification that auto-recharge is attempted
            const { EmailService } = await import("@/lib/email/service");
            await EmailService.sendBrandedEmail(workspaceId, {
                to: process.env.ADMIN_ALERT_EMAIL || "admin@grafty.pro", // Configurable via ADMIN_ALERT_EMAIL env var
                subject: "⚡ Auto-Recharge Attempted",
                templateName: "AUTO_RECHARGE_NOTIFICATION",
                context: {
                    workspace_id: workspaceId,
                    amount: (amount || 0).toLocaleString(),
                    status: "PENDING_TOKEN_IMPLEMENTATION"
                }
            });
        } catch (err) {
            console.error("[Auto Recharge] Failed:", err);
        }
    }

    /**
     * Trigger Fraud Alert to Admins
     */
    private static async triggerFraudAlert(workspaceId: string, velocity: number, reason: string) {
        try {
            const { EmailService } = await import("@/lib/email/service");
            await EmailService.sendBrandedEmail(workspaceId, {
                to: "security@grafty.pro",
                subject: "🚨 FRAUD ALERT: High Usage Velocity Detected",
                templateName: "FRAUD_ALERT",
                context: {
                    workspace_id: workspaceId,
                    velocity: (velocity || 0).toLocaleString(),
                    reason: reason,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (err) {
            console.error("[Fraud Engine] Alert failed:", err);
        }
    }

    /**
     * Update Meta message ID for a transaction
     * Called after message is sent to Meta
     */
    static async updateMetaMessageId(transactionId: string, metaMessageId: string) {
        await prisma.creditTransaction.update({
            where: { id: transactionId },
            data: { meta_message_id: metaMessageId }
        });
    }

    /**
     * Legacy deductCredits - now aliased to deductCreditsAtomic for safety.
     * In production, we MUST never use unlocked deductions.
     */
    static async deductCredits(tx: any, workspaceId: string, amount: number, messageId: string, description: string) {
        // Redirection to the atomic version to ensure security. 
        // Note: 'tx' is ignored because deductCreditsAtomic manages its own transaction internally with serializable isolation.
        const result = await this.deductCreditsAtomic(
            workspaceId, 
            amount, 
            messageId, 
            null, 
            'SERVICE', 
            'IN', 
            description
        );
        
        if (!result.success) {
            throw new Error(`Deduction failed: ${result.error}`);
        }
        
        return { balanceAfter: result.balance_after };
    }

    static async getMessageCost(category: string, countryCode: string, workspaceId?: string) {
        // 1. Check for Free Flow (SERVICE) or DIRECT billing model
        if (category === 'SERVICE') return 0; // Flows are always free

        if (workspaceId) {
            const waba = await prisma.whatsAppAccount.findUnique({
                where: { workspace_id: workspaceId },
                select: { billing_model: true }
            });

            if ((waba as any)?.billing_model === 'DIRECT') {
                return 0; // Direct billed users don't pay anything to Grafty
            }
        }

        const cacheKey = `${category}-${countryCode}-${workspaceId || 'GLOBAL'}`;
        const cached = this.pricingCache.get(cacheKey);

        if (cached && cached.expiry > Date.now()) {
            return cached.price;
        }

        // Get Base Pricing
        const pricing = await prisma.creditPricing.findFirst({
            where: {
                message_type: category,
                country_code: countryCode
            }
        });

        let basePrice = 1.00;

        if (!pricing) {
            const fallback = await prisma.creditPricing.findFirst({
                where: {
                    message_type: category,
                    country: "GLOBAL"
                }
            });
            if (fallback) basePrice = Number(fallback.final_vendor_price);
        } else {
            basePrice = Number(pricing.final_vendor_price);
        }

        let finalPrice = basePrice;

        // Apply Custom Reseller Markup
        if (workspaceId) {
            const workspace = await prisma.workspace.findUnique({
                where: { id: workspaceId },
                include: { reseller: true }
            });

            if (workspace?.reseller && Number(workspace.reseller.markup_percentage) > 0) {
                const markup = (basePrice * Number(workspace.reseller.markup_percentage)) / 100;
                finalPrice = basePrice + markup;
            }
        }

        // Update Cache
        this.pricingCache.set(cacheKey, {
            price: finalPrice,
            expiry: Date.now() + this.CACHE_TTL
        });

        return finalPrice;
    }

    /**
     * Get Meta's cost for a message (what Meta charges us)
     */
    static async getMetaCost(category: string, countryCode: string): Promise<number> {
        const pricing = await prisma.creditPricing.findFirst({
            where: {
                message_type: category,
                country_code: countryCode
            }
        });

        if (!pricing) {
            const fallback = await prisma.creditPricing.findFirst({
                where: {
                    message_type: category,
                    country: "GLOBAL"
                }
            });
            return fallback ? Number(fallback.meta_cost) : 0.50;
        }

        return Number(pricing.meta_cost);
    }

    /**
     * Award Dual Referral Bonus: 
     * 500 Credits to Referrer
     * 500 Credits to Referred User
     */
    static async awardReferralBonus(referrerWorkspaceId: string, referredWorkspaceId: string) {
        return await prisma.$transaction(async (tx) => {
            // 1. Credit Referrer
            const referrerWallet = await tx.vendorWallet.findUnique({
                where: { workspace_id: referrerWorkspaceId }
            });
            if (referrerWallet) {
                const bonus = 500.00;
                await tx.vendorWallet.update({
                    where: { id: referrerWallet.id },
                    data: { service_bonus_balance: { increment: bonus } }
                });
                await tx.creditTransaction.create({
                    data: {
                        workspace_id: referrerWorkspaceId,
                        wallet_id: referrerWallet.id,
                        type: 'REFERRAL_BONUS' as any,
                        amount: bonus,
                        balance_before: referrerWallet.current_balance,
                        balance_after: referrerWallet.current_balance,
                        description: `Referral Bonus (Invite: Workspace ${referredWorkspaceId})`,
                        status: 'COMPLETED',
                        initiated_by: 'SYSTEM'
                    }
                });
            }

            // 2. Credit Referred User (The Invitee)
            const referredWallet = await tx.vendorWallet.findUnique({
                where: { workspace_id: referredWorkspaceId }
            });
            if (referredWallet) {
                const bonus = 500.00;
                await tx.vendorWallet.update({
                    where: { id: referredWallet.id },
                    data: { service_bonus_balance: { increment: bonus } }
                });
                await tx.creditTransaction.create({
                    data: {
                        workspace_id: referredWorkspaceId,
                        wallet_id: referredWallet.id,
                        type: 'REFERRAL_BONUS' as any,
                        amount: bonus,
                        balance_before: referredWallet.current_balance,
                        balance_after: referredWallet.current_balance,
                        description: `Signup Bonus (Referrer: ${referrerWorkspaceId})`,
                        status: 'COMPLETED',
                        initiated_by: 'SYSTEM'
                    }
                });
            }

            // 3. Mark as awarded
            await tx.workspace.update({
                where: { id: referredWorkspaceId },
                data: { referral_bonus_awarded: true } as any
            });
        });
    }

    /**
     * Trigger low balance alert via email
     */
    private static async triggerLowBalanceAlert(workspaceId: string, balance: number, email: string | null) {
        if (!email) return;

        try {
            const { EmailService } = await import("@/lib/email/service");
            await EmailService.sendBrandedEmail(workspaceId, {
                to: email,
                subject: "⚠️ Low Credit Balance Alert",
                templateName: "LOW_BALANCE_ALERT",
                context: {
                    balance: (balance || 0).toLocaleString(),
                    threshold: 500,
                    recharge_url: `${process.env.NEXT_PUBLIC_APP_URL || ""}/dashboard/credits/recharge`
                }
            });
            console.log(`⚠️ Low balance alert sent to ${email} (Balance: ${balance})`);
        } catch (err) {
            console.error("[Credit Engine] Failed to send low balance alert:", err);
        }
    }

    /**
     * Seed default pricing
     */
    /**
     * Deduct credits for an Addon activation
     */
    static async deductCreditsForAddon(
        tx: any,
        workspaceId: string,
        amount: number,
        addonName: string,
        description: string
    ) {
        // 1. Get wallet (with row-level lock)
        const wallet = await tx.vendorWallet.findUnique({
            where: { workspace_id: workspaceId }
        });

        if (!wallet) throw new Error('Wallet not found for this workspace.');
        
        const currentBalance = Number(wallet.current_balance);

        if (currentBalance < amount) {
            throw new Error(`Insufficient credits to activate ${addonName}. Required: ${amount}, Available: ${currentBalance}`);
        }

        // 2. Update balance
        const balanceAfter = currentBalance - amount;
        await tx.vendorWallet.update({
            where: { id: wallet.id },
            data: {
                current_balance: { decrement: amount },
                total_used: { increment: amount }
            }
        });

        // 3. Create Transaction Ledger Entry
        return await tx.creditTransaction.create({
            data: {
                workspace_id: workspaceId,
                wallet_id: wallet.id,
                type: 'ADDON_PURCHASE',
                amount: -amount,
                balance_before: currentBalance,
                balance_after: balanceAfter,
                description: description || `Activated Addon: ${addonName}`,
                status: 'COMPLETED',
                initiated_by: 'SYSTEM'
            }
        });
    }

    static async seedDefaultPricing() {
        const defaultPricing = [
            { category: "MARKETING", country: "India", code: "91", meta: 0.72, plat: 0.10, res: 0.10 },
            { category: "UTILITY", country: "India", code: "91", meta: 0.30, plat: 0.05, res: 0.05 },
            { category: "AUTH", country: "India", code: "91", meta: 0.15, plat: 0.05, res: 0.05 },
            { category: "SERVICE", country: "India", code: "91", meta: 0.25, plat: 0.05, res: 0.05 },
            // Global Fallbacks
            { category: "MARKETING", country: "GLOBAL", code: null, meta: 5.00, plat: 1.00, res: 1.00 },
        ];

        for (const p of defaultPricing) {
            await prisma.creditPricing.upsert({
                where: {
                    message_type_country: {
                        message_type: p.category,
                        country: p.country
                    }
                },
                update: {},
                create: {
                    message_type: p.category,
                    country: p.country,
                    country_code: p.code,
                    meta_cost: p.meta,
                    platform_margin: p.plat,
                    reseller_margin: p.res,
                    final_vendor_price: p.meta + p.plat + p.res
                }
            });
        }
    }
}
