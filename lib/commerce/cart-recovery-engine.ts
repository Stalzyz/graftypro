import { prisma } from '../db';
import { WhatsAppService } from '../whatsapp/service';
import { decrypt } from '../security/encryption';

export class CartRecoveryEngine {
    /**
     * Checks for abandoned carts and triggers recovery messages.
     * Designed to be called via a cron job (e.g., every 15 minutes).
     */
    static async processAbandonedCarts() {
        console.log('[CartRecovery] Starting abandoned cart check...');
        const ONE_HOUR_AGO = new Date(Date.now() - 60 * 60 * 1000);
        const TWO_HOURS_AGO = new Date(Date.now() - 2 * 60 * 60 * 1000);

        try {
            // Find carts updated between 1 and 2 hours ago that haven't been recovered yet
            // Assuming a 'Cart' model exists in prisma with relevant fields.
            // Adjust to the actual schema.
            const abandonedCarts = await (prisma as any).cart.findMany({
                where: {
                    status: 'ACTIVE',
                    updatedAt: {
                        lte: ONE_HOUR_AGO,
                        gte: TWO_HOURS_AGO
                    },
                    recoverySent: false,
                    customerPhone: { not: null }
                },
                include: {
                    items: true,
                    workspace: {
                        include: { whatsAppAccount: true }
                    }
                }
            });

            console.log(`[CartRecovery] Found ${abandonedCarts.length} abandoned carts to process.`);

            for (const cart of abandonedCarts) {
                if (!cart.workspace?.whatsAppAccount) continue;
                
                const waAccount = cart.workspace.whatsAppAccount;
                const token = decrypt(waAccount.access_token);
                const phoneId = waAccount.phone_number_id;

                if (!cart.items || cart.items.length === 0) continue;

                // Send a multi-product message with the cart items
                try {
                    const productRetailerIds = cart.items.map((item: any) => item.productId);
                    
                    await WhatsAppService.sendMultiProductMessage(
                        phoneId,
                        token,
                        cart.customerPhone,
                        waAccount.catalog_id || process.env.DEFAULT_CATALOG_ID || "CATALOG_ID",
                        "Hi there! We noticed you left some items in your cart. Ready to complete your purchase?",
                        [
                            {
                                title: "Your Cart Items",
                                product_retailer_ids: productRetailerIds
                            }
                        ],
                        cart.workspaceId,
                        "MARKETING",
                        "Cart Recovery"
                    );

                    // Mark as sent
                    await (prisma as any).cart.update({
                        where: { id: cart.id },
                        data: { recoverySent: true }
                    });
                    
                    console.log(`[CartRecovery] Successfully sent recovery message to ${cart.customerPhone}`);
                } catch (sendError: any) {
                    console.error(`[CartRecovery] Failed to send recovery to ${cart.customerPhone}:`, sendError.message);
                }
            }

        } catch (error: any) {
            console.error('[CartRecovery] Engine Error:', error.message);
        }
    }
}
