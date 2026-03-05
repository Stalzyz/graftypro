
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { headers } from "next/headers";
import { ResellerService } from "../../../../lib/reseller/service";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const resellerId = headers().get("x-reseller-id");
        if (!resellerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { amount, payment_method, payment_details } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        // Use the refined service to request payout (includes fraud checks)
        const payout = await ResellerService.requestPayout(resellerId, amount, {
            method: payment_method,
            details: payment_details
        });

        return NextResponse.json({
            success: true,
            payoutId: payout.id,
            status: payout.status
        });

    } catch (error: any) {
        console.error("Payout Request Error:", error.message);
        return NextResponse.json({ error: error.message || "Request failed" }, { status: 400 });
    }
}

export async function GET(req: Request) {
    try {
        const resellerId = headers().get("x-reseller-id");
        if (!resellerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payouts = await prisma.resellerPayoutRequest.findMany({
            where: { reseller_id: resellerId },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json({ payouts });

    } catch (error) {
        return NextResponse.json({ error: "Load Failed" }, { status: 500 });
    }
}
