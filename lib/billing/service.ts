import { prisma } from "../db";
import { EmailService } from "../email/service";

export class BillingService {
    /**
     * PHASE B: Top-Up & Invoice Generator
     */
    static async processTopUp(resellerId: string, amount: number) {
        const { ResellerFinanceEngine } = require("../reseller/finance-engine");

        return await prisma.$transaction(async (tx) => {
            const reseller = await tx.reseller.findUnique({ where: { id: resellerId } });
            if (!reseller) throw new Error("Reseller not found");

            // 1. Generate Invoice Number
            const year = new Date().getFullYear();
            const count = await tx.resellerInvoice.count();
            const invoiceNumber = `INV-${year}-${(count + 1).toString().padStart(4, '0')}`;

            // 2. Create Formal Invoice with 18% GST
            const subtotal = amount;
            const tax = subtotal * 0.18;
            const total = subtotal + tax;

            const invoice = await tx.resellerInvoice.create({
                data: {
                    invoice_number: invoiceNumber,
                    reseller_id: resellerId,
                    amount_subtotal: subtotal,
                    tax_amount: tax,
                    amount_total: total,
                    status: 'PAID',
                    paid_at: new Date(),
                    billing_details: {
                        name: reseller.name,
                        gst: reseller.gst_number,
                    }
                }
            });

            // 3. Record in Ledger & Update Wallet
            await ResellerFinanceEngine.recordTransaction(tx, {
                resellerId: resellerId,
                amount: amount,
                type: 'ADJUSTMENT',
                description: `Wallet top-up. Invoice: ${invoiceNumber}`,
                referenceId: invoice.id
            });

            return invoice;
        });
    }

    /**
     * PHASE B: Low Credit Monitor
     * Checks if a reseller needs a refill.
     */
    static async checkLowCredit(resellerId: string) {
        const reseller = await prisma.reseller.findUnique({
            where: { id: resellerId }
        });

        if (reseller && Number(reseller.wallet_balance) < Number(reseller.low_credit_threshold)) {
            console.log(`[Billing Alert] Reseller ${reseller.name} is below threshold!`);

            // Trigger Branded Notification
            await EmailService.sendBrandedEmail("", { // Workspace empty for reseller system email
                to: reseller.email,
                subject: "Low Balance Alert",
                templateName: "LOW_CREDIT",
                context: {
                    currentBalance: reseller.wallet_balance,
                    threshold: reseller.low_credit_threshold
                }
            });

            return true;
        }
        return false;
    }

    /**
     * Fetches invoices for a reseller.
     */
    static async getInvoices(resellerId: string) {
        return prisma.resellerInvoice.findMany({
            where: { reseller_id: resellerId },
            orderBy: { created_at: 'desc' }
        });
    }
}
