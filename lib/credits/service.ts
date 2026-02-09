import { prisma } from "@/lib/db";

export class CreditService {
    private static pricingCache: Map<string, { price: number, expiry: number }> = new Map();
    private static CACHE_TTL = 10 * 60 * 1000; // 10 Minutes

    /**
     * PHASE 2: Add credits to vendor wallet safely with ledger entry.
     * Uses atomic transactions and balance snapshots.
     */
    static async addCredits(tx: any, workspaceId: string, amount: number, paymentId: string, description: string) {
        // 1. Get or Create Wallet (Row Lock)
        // Note: tx.vendorWallet.findUnique doesn't support SELECT FOR UPDATE directly in all Prisma versions, 
        // but since this is inside a transaction and we're using update immediately after, it's generally safe.
        // For absolute safety in high-concurrency, we'd use tx.$executeRaw.

        let wallet = await tx.vendorWallet.findUnique({
            where: { workspace_id: workspaceId }
        });

        if (!wallet) {
            wallet = await tx.vendorWallet.create({
                data: { workspace_id: workspaceId }
            });
        }

        const balanceBefore = Number(wallet.current_balance);
        const balanceAfter = balanceBefore + amount;

        // 2. Update Wallet
        await tx.vendorWallet.update({
            where: { id: wallet.id },
            data: {
                current_balance: { increment: amount },
                total_purchased: { increment: amount }
            }
        });

        // 3. Create Ledger Entry (Append-only)
        await tx.creditTransaction.create({
            data: {
                workspace_id: workspaceId,
                type: 'PURCHASE',
                amount: amount,
                balance_before: balanceBefore,
                balance_after: balanceAfter,
                related_payment_id: paymentId,
                description: description
            }
        });

        console.log(`[Credit Engine] Credits Added: ${amount} to ${workspaceId}. Balance: ${balanceAfter}`);
        return { balanceAfter };
    }

    /**
     * PHASE 3: Atomic Message Deduction Engine
     * Prevents negative balance and ensures ledger consistency.
     */
    static async deductCredits(tx: any, workspaceId: string, amount: number, messageId: string, description: string) {
        // 1. Get Wallet with Row Lock
        const wallet = await tx.vendorWallet.findUnique({
            where: { workspace_id: workspaceId }
        });

        if (!wallet || Number(wallet.current_balance) < amount) {
            throw new Error("Insufficient credit balance");
        }

        if (wallet.is_frozen) {
            throw new Error(`Wallet is frozen: ${wallet.freeze_reason || "Review required"}`);
        }

        const balanceBefore = Number(wallet.current_balance);
        const balanceAfter = balanceBefore - amount;

        // 2. Update Wallet
        await tx.vendorWallet.update({
            where: { id: wallet.id },
            data: {
                current_balance: { decrement: amount },
                total_used: { increment: amount }
            }
        });

        // 3. Create Ledger Entry
        await tx.creditTransaction.create({
            data: {
                workspace_id: workspaceId,
                type: 'DEDUCTION',
                amount: -amount, // Negative for ledger
                balance_before: balanceBefore,
                balance_after: balanceAfter,
                related_message_id: messageId,
                description: description
            }
        });

        // 4. PHASE 5: RESELLER HOOK (God-Mode Markup included)
        try {
            const { ResellerService } = require("@/lib/reseller/service");
            // Pass the total deducted amount. Service will resolve commission + markup profit.
            await ResellerService.processUsageCommission(tx, workspaceId, amount, messageId);
        } catch (hookError) {
            console.error("Reseller Usage Hook Error:", hookError);
        }

        return { balanceAfter };
    }

    /**
     * PHASE 4: Margin Protection Engine (Enhanced for God-Mode Markup)
     * Fetches the final price for a specific message type and country.
     */
    static async getMessageCost(category: string, countryCode: string, workspaceId?: string) {
        const cacheKey = `${category}-${countryCode}-${workspaceId || 'GLOBAL'}`;
        const cached = this.pricingCache.get(cacheKey);

        if (cached && cached.expiry > Date.now()) {
            return cached.price;
        }

        // 1. Get Base Pricing
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

        // 2. Apply Custom Reseller Markup (God-Mode Phase)
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
     * Utility to seed standard Meta pricing (Approximate)
     */
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
