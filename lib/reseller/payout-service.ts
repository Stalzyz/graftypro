import { prisma } from "../db";
import { encrypt, decrypt } from "../security/encryption";
import axios from "axios";
import { EmailService } from "../email/service";

/**
 * Reseller Payout Service - RazorpayX Integration
 * 
 * Handles automated payouts to resellers via IMPS/NEFT/UPI.
 */
export class ResellerPayoutService {
    private static BASE_URL = "https://api.razorpay.com/v1";
    private static ACCOUNT_NUMBER = process.env.RAZORPAYX_ACCOUNT_NUMBER;
    private static KEY_ID = process.env.RAZORPAY_KEY_ID;
    private static KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

    private static getAuth() {
        return {
            auth: {
                username: this.KEY_ID || "",
                password: this.KEY_SECRET || ""
            }
        };
    }

    /**
     * Sync Reseller as a RazorpayX Contact
     */
    static async syncContact(resellerId: string) {
        const reseller = await prisma.reseller.findUnique({
            where: { id: resellerId }
        });

        if (!reseller) throw new Error("Reseller not found");
        if (reseller.razorpayx_contact_id) return reseller.razorpayx_contact_id;

        try {
            const response = await axios.post(`${this.BASE_URL}/contacts`, {
                name: reseller.name,
                email: reseller.email,
                type: "vendor",
                reference_id: reseller.id,
                notes: {
                    business_name: reseller.business_name || ""
                }
            }, this.getAuth());

            const contactId = response.data.id;
            await prisma.reseller.update({
                where: { id: resellerId },
                data: { razorpayx_contact_id: contactId }
            });

            return contactId;
        } catch (error: any) {
            console.error("RazorpayX Contact Error:", error.response?.data || error.message);
            throw new Error(`Failed to create RazorpayX contact: ${error.response?.data?.error?.description || error.message}`);
        }
    }

    /**
     * Sync Bank Account as a RazorpayX Fund Account
     */
    static async syncFundAccount(resellerId: string) {
        const reseller = await prisma.reseller.findUnique({
            where: { id: resellerId }
        });

        if (!reseller) throw new Error("Reseller not found");
        if (reseller.razorpayx_fund_account_id) return reseller.razorpayx_fund_account_id;

        const contactId = await this.syncContact(resellerId);

        if (!reseller.bank_account_number || !reseller.bank_ifsc) {
            throw new Error("Bank details missing from reseller profile");
        }

        const accountNumber = decrypt(reseller.bank_account_number);
        const ifsc = decrypt(reseller.bank_ifsc);
        const holderName = reseller.bank_account_holder ? decrypt(reseller.bank_account_holder) : reseller.name;

        try {
            const response = await axios.post(`${this.BASE_URL}/fund_accounts`, {
                contact_id: contactId,
                account_type: "bank_account",
                bank_account: {
                    name: holderName,
                    ifsc: ifsc,
                    account_number: accountNumber
                }
            }, this.getAuth());

            const fundAccountId = response.data.id;
            await prisma.reseller.update({
                where: { id: resellerId },
                data: { razorpayx_fund_account_id: fundAccountId }
            });

            return fundAccountId;
        } catch (error: any) {
            console.error("RazorpayX Fund Account Error:", error.response?.data || error.message);
            throw new Error(`Failed to create Fund Account: ${error.response?.data?.error?.description || error.message}`);
        }
    }

    /**
     * Execute Automated Payout
     */
    static async executePayout(requestId: string, adminId: string, txContext?: any) {
        const execute = async (tx: any) => {
            const request = await tx.resellerPayoutRequest.findUnique({
                where: { id: requestId },
                include: { reseller: true }
            });

            if (!request) throw new Error("Payout request not found");
            if (request.status !== "PENDING") throw new Error("Payout already processed");

            const reseller = request.reseller;
            const amount = Number(request.amount);

            if (Number(reseller.wallet_balance) < amount) {
                throw new Error("Insufficient reseller wallet balance");
            }

            // 1. Sync Payout Identity
            // Note: In transaction, we can't easily wait for external API call while holding locks, 
            // but for Payouts it's often safer to do outside or handle idempotency.
            // For now, we'll assume the calls happen.
            
            const fundAccountId = await this.syncFundAccount(reseller.id);

            // 2. Trigger RazorpayX Payout
            const idempotencyKey = `payout_${request.id}`;
            
            try {
                const response = await axios.post(`${this.BASE_URL}/payouts`, {
                    account_number: this.ACCOUNT_NUMBER,
                    fund_account_id: fundAccountId,
                    amount: amount * 100, // to paise
                    currency: "INR",
                    mode: "IMPS",
                    purpose: "payout",
                    queue_if_low_balance: true,
                    reference_id: request.id,
                    notes: {
                        reseller_name: reseller.name
                    }
                }, {
                    ...this.getAuth(),
                    headers: { "X-Payout-Idempotency": idempotencyKey }
                });

                const rzpPayoutId = response.data.id;

                // 3. Update Ledger and Request
                const balanceAfter = Number(reseller.wallet_balance) - amount;

                await tx.reseller.update({
                    where: { id: reseller.id },
                    data: {
                        wallet_balance: { decrement: amount }
                    }
                });

                await tx.resellerLedger.create({
                    data: {
                        reseller_id: reseller.id,
                        amount: -amount,
                        type: "PAYOUT",
                        description: `Automated Payout via RazorpayX (ID: ${rzpPayoutId})`,
                        reference_id: request.id,
                        balance_after: balanceAfter
                    }
                });

                await tx.resellerPayoutRequest.update({
                    where: { id: requestId },
                    data: {
                        status: "PAID",
                        gateway_payout_id: rzpPayoutId,
                        processed_by: adminId,
                        processed_at: new Date()
                    }
                });

                // Send Confirmation Alert
                await EmailService.sendResellerPayoutEmail(reseller.id, {
                    amount: amount,
                    status: "PAID",
                    payoutId: rzpPayoutId
                });

                return { success: true, payoutId: rzpPayoutId };

            } catch (error: any) {
                console.error("RazorpayX Payout execution error:", error.response?.data || error.message);
                throw new Error(`Payout Failed: ${error.response?.data?.error?.description || error.message}`);
            }
        };

        if (txContext) {
            return await execute(txContext);
        } else {
            return await prisma.$transaction(async (tx) => await execute(tx));
        }
    }
}
