import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { CommerceService } from "../../../../lib/commerce/service";

export const dynamic = "force-dynamic";

/**
 * Public/Bot accessible order creation endpoint
 */
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { storeId, contactId, items, shippingAddress, paymentMethod, referralCode, couponCode } = body;

        if (!storeId || !contactId || !items || items.length === 0) {
            return NextResponse.json({ error: "Missing required order fields" }, { status: 400 });
        }

        const order = await CommerceService.createOrder({
            store_id: storeId,
            contact_id: contactId,
            items,
            shipping_address: shippingAddress,
            payment_method: paymentMethod || "COD",
            referral_code: referralCode,
            coupon_code: couponCode
        });

        return NextResponse.json({
            success: true,
            orderId: order.id,
            orderNumber: order.order_number,
            total: order.total_amount
        });

    } catch (error: any) {
        console.error("Order Creation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
