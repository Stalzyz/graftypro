import { prisma } from "../db";
import { WhatsAppService } from "../whatsapp/service";
import { decrypt } from "../security/encryption";

export class LogisticsAutomationService {
    /**
     * Send a notification to the customer about their order status.
     */
    static async notifyCustomer(orderId: string, status: string, trackingDetails?: any) {
        try {
            // 1. Fetch Order and Store data
            const order = await prisma.commerceOrder.findUnique({
                where: { id: orderId },
                include: {
                    store: true,
                    contact: true
                }
            });

            if (!order || !order.contact?.phone) return;

            // 2. Fetch WhatsApp Account for the workspace
            const whatsappAccount = await prisma.whatsAppAccount.findUnique({
                where: { workspace_id: order.store.workspace_id }
            });

            if (!whatsappAccount || !whatsappAccount.access_token) {
                console.warn("[LogisticsAutomation] WhatsApp account not found or token missing for workspace:", order.store.workspace_id);
                return;
            }

            const token = decrypt(whatsappAccount.access_token);
            const phoneId = whatsappAccount.phone_number_id;

            // Clean Phone Number (Remove +, spaces, etc)
            const cleanPhone = order.contact.phone.replace(/\D/g, "");

            // 3. Construct Message
            let message = "";
            const orderNumber = order.order_number;
            const courier = order.courier_name || "our shipping partner";
            const trackingId = order.tracking_id;
            
            // Build Tracking Link (assuming the dashboard has a generic order tracking page)
            const trackingLink = `https://grafty.pro/track/${orderNumber}`;

            switch (status.toUpperCase()) {
                case "SHIPPED":
                case "IN_TRANSIT":
                case "OUT FOR DELIVERY":
                case "PICKED UP":
                    message = `🚚 *Order Shipped!*\n\nHello ${order.contact.name || "Customer"},\n\nYour order *${orderNumber}* has been picked up by *${courier}*.\n\n📍 *Status:* ${status}\n📦 *AWB:* ${trackingId}\n\n🔗 *Track Live:* ${trackingLink}`;
                    break;
                case "DELIVERED":
                    message = `🎉 *Order Delivered!*\n\nGreat news! Your order *${orderNumber}* has been successfully delivered.\n\nWe hope you love your purchase! 🔗 *History:* ${trackingLink}`;
                    break;
                case "CANCELLED":
                    message = `⚠️ *Order Update*\n\nYour order *${orderNumber}* has been cancelled. For details, visit: ${trackingLink}`;
                    break;
                default:
                    return; // Don't send notification for unknown statuses
            }

            // 4. Send Message
            console.log(`[LogisticsAutomation] Sending ${status} notification to ${cleanPhone}`);
            await WhatsAppService.sendText(phoneId, token, cleanPhone, message);

        } catch (error: any) {
            console.error("[LogisticsAutomation] Error:", error.message);
        }
    }
}
