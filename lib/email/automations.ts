import { prisma } from "@/lib/db";
import { BulkEmailEngine } from "./bulk-engine";

/**
 * ⚡ Grafty Pulse: Intelligence Automation Engine
 * Autonomous marketing sequences triggered by real-world events.
 * All sequences respect addon gating and suppression lists.
 */

/**
 * 🛡️ Guard: Check if a workspace has the Bulk Email addon active.
 * Prevents automations from firing for non-subscribed workspaces.
 */
async function hasEmailAddon(workspaceId: string): Promise<boolean> {
    const addon = await (prisma as any).workspaceAddon.findFirst({
        where: {
            workspace_id: workspaceId,
            addon: { name: "BULK_EMAIL_CHANNEL" },
            status: "ACTIVE"
        }
    });
    return !!addon;
}

// ─────────────────────────────────────────────────────────────────────────────
// AUTOMATION 1: Royal Welcome (Contact Creation Trigger)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fires when a new contact with an email address is added to a workspace.
 * Sends an instant, personalized welcome message.
 */
export async function triggerWelcomeEmail(payload: {
    workspaceId: string;
    contactEmail: string;
    contactName?: string;
}) {
    const { workspaceId, contactEmail, contactName } = payload;

    if (!contactEmail) return;
    if (!(await hasEmailAddon(workspaceId))) return;

    const firstName = contactName?.split(" ")[0] || "there";

    const html = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a2e;">
  <div style="background: linear-gradient(135deg, #27954D, #042f94); border-radius: 24px; padding: 48px 40px; text-align: center; margin-bottom: 32px;">
    <h1 style="color: white; font-size: 28px; font-weight: 900; margin: 0 0 12px;">
      Welcome, ${firstName}! 👋
    </h1>
    <p style="color: rgba(255,255,255,0.85); font-size: 16px; margin: 0;">
      We're thrilled to have you with us.
    </p>
  </div>
  
  <div style="background: #f8fafc; border-radius: 16px; padding: 32px; margin-bottom: 24px;">
    <p style="color: #475569; font-size: 15px; line-height: 1.7; margin: 0 0 24px;">
      You've just joined an exclusive community. Explore our latest products, get exclusive deals, and discover what makes us unique.
    </p>
    <a href="#" style="display: inline-block; background: #27954D; color: white; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 700; font-size: 14px;">
      Explore Now →
    </a>
  </div>
  
  <p style="color: #94a3b8; font-size: 11px; text-align: center; margin: 0;">
    You're receiving this because you recently connected with us.
  </p>
</body>
</html>`;

    await BulkEmailEngine.sendSingleEmail({
        workspaceId,
        to: contactEmail,
        subject: `Welcome, ${firstName}! Here's what's waiting for you 🎉`,
        html,
        tags: [{ name: "automation", value: "welcome" }]
    });
}


// ─────────────────────────────────────────────────────────────────────────────
// AUTOMATION 2: Abandoned Cart Recovery (Order Creation Trigger)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fires when a new order is placed but NOT immediately paid (COD or PENDING status).
 * Schedules a recovery email 2 hours later if the order is still unpaid.
 */
export async function scheduleAbandonedCartRecovery(payload: {
    workspaceId: string;
    orderId: string;
    contactId: string;
    orderNumber: string;
    totalAmount: number;
}) {
    const { workspaceId, orderId, contactId, orderNumber, totalAmount } = payload;

    if (!(await hasEmailAddon(workspaceId))) return;

    // Schedule the check in 2 hours (using setTimeout for simplicity.
    // In production, this should be a BullMQ job for reliability across restarts.)
    const DELAY_MS = 2 * 60 * 60 * 1000; // 2 hours

    setTimeout(async () => {
        try {
            // Re-fetch the order to check if it's still pending
            const order = await (prisma as any).commerceOrder.findUnique({
                where: { id: orderId },
                include: {
                    contact: true,
                    items: { include: { product: true } }
                }
            });

            if (!order || !["PLACED", "PENDING"].includes(order.status)) {
                // Order has been paid or cancelled — no need to fire
                return;
            }

            const contact = order.contact;
            if (!contact?.email) return;

            const firstName = contact.name?.split(" ")[0] || "there";
            const itemList = order.items
                .map((item: any) => `<li style="padding: 4px 0; color: #475569;">${item.name} × ${item.quantity}</li>`)
                .join("");

            const html = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a2e;">
  <div style="border-left: 4px solid #f59e0b; padding-left: 20px; margin-bottom: 32px;">
    <h1 style="font-size: 24px; font-weight: 900; margin: 0 0 8px; color: #1a1a2e;">
      ${firstName}, you left something behind! 🛒
    </h1>
    <p style="color: #64748b; margin: 0;">Your order <strong>#${orderNumber}</strong> is waiting to be completed.</p>
  </div>

  <div style="background: #f8fafc; border-radius: 16px; padding: 24px; margin-bottom: 24px;">
    <p style="font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #94a3b8; margin: 0 0 12px;">Items in your cart</p>
    <ul style="margin: 0; padding: 0 0 0 20px;">
      ${itemList}
    </ul>
    <div style="border-top: 1px solid #e2e8f0; margin-top: 16px; padding-top: 16px; display: flex; justify-content: space-between;">
      <span style="font-weight: 700; color: #1a1a2e;">Total</span>
      <span style="font-weight: 900; font-size: 18px; color: #27954D;">₹${totalAmount.toFixed(2)}</span>
    </div>
  </div>

  <div style="text-align: center;">
    <a href="#" style="display: inline-block; background: linear-gradient(135deg, #27954D, #1e7a3d); color: white; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: 900; font-size: 14px; letter-spacing: 0.05em;">
      Complete My Order →
    </a>
    <p style="color: #94a3b8; font-size: 12px; margin-top: 16px;">This offer expires in 24 hours.</p>
  </div>
</body>
</html>`;

            await BulkEmailEngine.sendSingleEmail({
                workspaceId,
                to: contact.email,
                subject: `${firstName}, your cart (₹${totalAmount.toFixed(2)}) is about to expire ⚡`,
                html,
                tags: [
                    { name: "automation", value: "abandoned_cart" },
                    { name: "order_id", value: orderId }
                ]
            });
        } catch (e) {
            console.error("🚨 [ABANDONED-CART-FAIL]:", e);
        }
    }, DELAY_MS);
}


// ─────────────────────────────────────────────────────────────────────────────
// AUTOMATION 3: Post-Purchase Review Booster (Order Delivered Trigger)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fires when an order status is updated to DELIVERED.
 * Sends a review request 24 hours after delivery.
 */
export async function triggerReviewBooster(payload: {
    workspaceId: string;
    orderId: string;
    contactEmail: string;
    contactName?: string;
    orderNumber: string;
}) {
    const { workspaceId, orderId, contactEmail, contactName, orderNumber } = payload;

    if (!contactEmail) return;
    if (!(await hasEmailAddon(workspaceId))) return;

    const DELAY_MS = 24 * 60 * 60 * 1000; // 24 hours
    const firstName = contactName?.split(" ")[0] || "there";

    setTimeout(async () => {
        const html = `
<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a2e; text-align: center;">
  <div style="font-size: 64px; margin-bottom: 16px;">⭐</div>
  <h1 style="font-size: 26px; font-weight: 900; margin: 0 0 12px;">
    How was your experience, ${firstName}?
  </h1>
  <p style="color: #64748b; font-size: 15px; max-width: 400px; margin: 0 auto 32px;">
    Your order <strong>#${orderNumber}</strong> has been delivered! We'd love to hear your thoughts — it takes just 30 seconds.
  </p>
  
  <div style="background: #f8fafc; border-radius: 16px; padding: 32px; margin-bottom: 32px; display: inline-block;">
    <p style="font-size: 13px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 16px;">Rate your experience</p>
    <div style="font-size: 36px; letter-spacing: 8px;">⭐⭐⭐⭐⭐</div>
  </div>
  
  <br/>
  <a href="#" style="display: inline-block; background: #042f94; color: white; text-decoration: none; padding: 14px 36px; border-radius: 50px; font-weight: 700; font-size: 14px;">
    Leave a Review
  </a>
  
  <p style="color: #cbd5e1; font-size: 11px; margin-top: 32px;">
    Your feedback helps us improve and helps other customers discover us.
  </p>
</body>
</html>`;

        await BulkEmailEngine.sendSingleEmail({
            workspaceId,
            to: contactEmail,
            subject: `${firstName}, how was your order? ⭐ We'd love your feedback`,
            html,
            tags: [
                { name: "automation", value: "review_booster" },
                { name: "order_id", value: orderId }
            ]
        });
    }, DELAY_MS);
}
