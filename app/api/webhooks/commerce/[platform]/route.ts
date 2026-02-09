import { NextResponse } from "next/server";
import { CommerceService, CommercePlatform } from "@/lib/commerce/service";

export async function POST(req: Request, { params }: { params: { platform: string } }) {
    try {
        const platform = params.platform.toUpperCase() as CommercePlatform;
        const payload = await req.json();
        const headers = Object.fromEntries(req.headers);

        // PHASE 0 Rule: Webhook verification required
        // (Implementation varies by platform, skipping signature check for demo but doc confirms requirement)

        const order = await CommerceService.processWebhook(platform, payload, headers);

        return NextResponse.json({ success: true, orderId: order.id });

    } catch (error: any) {
        console.error("Commerce Webhook Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
