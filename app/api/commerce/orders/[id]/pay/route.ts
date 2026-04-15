import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../../lib/auth";
import { PaymentEngine } from "../../../../../../lib/commerce/payment-engine";

export const dynamic = "force-dynamic";

/**
 * POST /api/commerce/orders/[id]/pay
 * Generate a payment link for a specific order and send it to the customer.
 */
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user?.workspaceId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const orderId = params.id;
        if (!orderId) {
            return NextResponse.json({ error: "Order ID is required" }, { status: 400 });
        }

        const result = await PaymentEngine.createAndSendPaymentLink(orderId);

        return NextResponse.json({
            success: true,
            paymentUrl: result.paymentUrl,
            gateway: result.gateway,
            messageSent: result.messageSent
        });
    } catch (error: any) {
        console.error("[OrderPay API] Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
