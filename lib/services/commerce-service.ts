
import { prisma } from "../db";

export class CommerceService {
    /**
     * Process an incoming WhatsApp Order (Cart)
     */
    static async processWhatsAppOrder(workspaceId: string, contactId: string, orderData: any) {
        return await prisma.$transaction(async (tx) => {
            // 1. Calculate Total
            let totalAmount = 0;
            const items = orderData.product_items || [];

            for (const item of items) {
                totalAmount += (item.item_price || 0) * (item.quantity || 1);
            }

            // 2. Create Order
            const order = await tx.order.create({
                data: {
                    workspace_id: workspaceId,
                    contact_id: contactId,
                    total_amount: totalAmount,
                    currency: items[0]?.currency || "INR",
                    status: "PENDING",
                }
            });

            // 3. Create Order Items
            for (const item of items) {
                // Find local product by retailer_id (sku) if possible, else just store name
                const product = await tx.product.findFirst({
                    where: { workspace_id: workspaceId, sku: item.product_retailer_id }
                });

                await tx.orderItem.create({
                    data: {
                        order_id: order.id,
                        product_id: product?.id || "manual-entry", // Fallback if product not synced
                        quantity: item.quantity,
                        unit_price: item.item_price,
                        total_price: item.item_price * item.quantity
                    }
                });
            }

            return order;
        });
    }
}
