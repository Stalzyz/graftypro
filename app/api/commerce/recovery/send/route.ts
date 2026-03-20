import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";
import { WhatsAppService } from "../../../../../lib/whatsapp/service";
import { decrypt } from "../../../../../lib/security/encryption";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { orderId } = await req.json();
        if (!orderId) return NextResponse.json({ error: "Order ID is required" }, { status: 400 });

        // 1. Fetch Order and WABA config
        const order = await prisma.commerceOrder.findUnique({
            where: { id: orderId },
            include: { 
                contact: true,
                store: {
                    include: {
                        workspace: {
                            include: {
                                waba: true
                            }
                        }
                    }
                }
            }
        });

        if (!order || order.store.workspace_id !== user.workspaceId) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const waba = order.store.workspace.waba;
        if (!waba || !waba.access_token || !waba.phone_number_id) {
            return NextResponse.json({ error: "WhatsApp API not configured for this workspace" }, { status: 400 });
        }

        const token = decrypt(waba.access_token);
        const customerName = order.contact.name || "there";
        const orderLink = `https://${order.store.workspace.id}.grafty.app/checkout/${order.id}`; // placeholder for actual checkout link

        const message = `Hi ${customerName}! 👋\n\nWe noticed you left some items in your cart. 🛒\n\nComplete your order now and get them delivered soon! \n\nClick here to finish: ${orderLink}\n\nNeed help? Just reply to this message! 😊`;

        // 2. Send WhatsApp Message
        await WhatsAppService.sendText(
            waba.phone_number_id,
            token,
            order.contact.phone,
            message
        );

        // 3. Mark as recover sent (optional: could add a field to CommerceOrder)
        // For now, we'll just return success
        
        return NextResponse.json({ success: true, message: "Recovery message sent!" });

    } catch (error: any) {
        console.error("Recovery Send Error:", error);
        return NextResponse.json({ error: error.message || "Failed to send recovery" }, { status: 500 });
    }
}
