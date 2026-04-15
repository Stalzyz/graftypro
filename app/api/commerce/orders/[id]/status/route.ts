import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { triggerReviewBooster } from "@/lib/email/automations";

export const dynamic = "force-dynamic";

/**
 * PATCH /api/commerce/orders/[id]/status
 * Updates the status of an order and fires post-delivery automations.
 */
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { status } = await req.json();
        const validStatuses = ["PLACED", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"];
        if (!validStatuses.includes(status)) {
            return NextResponse.json({ error: "Invalid status" }, { status: 400 });
        }

        // Verify order belongs to this workspace
        const existing = await (prisma as any).commerceOrder.findFirst({
            where: {
                id: params.id,
                store: { workspace_id: user.workspaceId }
            },
            include: { contact: true, store: true }
        });

        if (!existing) {
            return NextResponse.json({ error: "Order not found" }, { status: 404 });
        }

        const updated = await (prisma as any).commerceOrder.update({
            where: { id: params.id },
            data: { status }
        });

        // 🛰️ AUTOMATION: Post-Purchase Review Booster
        // Fires 24 hours after an order is marked as DELIVERED
        if (status === "DELIVERED" && existing.contact?.email) {
            triggerReviewBooster({
                workspaceId: user.workspaceId,
                orderId: params.id,
                contactEmail: existing.contact.email,
                contactName: existing.contact.name || undefined,
                orderNumber: existing.order_number
            }).catch(e => console.error("[REVIEW-BOOSTER-FAIL]:", e));
        }

        return NextResponse.json({ success: true, data: updated });

    } catch (error: any) {
        console.error("Order Status Update Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
