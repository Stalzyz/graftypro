import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ResellerService } from "@/lib/reseller/service";

/**
 * PHASE: PAYOUT REQUEST API
 * Allows resellers to request withdrawal of their earned commission.
 */
export async function POST(req: Request) {
    try {
        const { resellerId, amount, paymentMethod, paymentDetails } = await req.json();

        if (!resellerId || !amount) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Submit Payout Request using Reseller Service (which handles Fraud/Balance checks)
        const request = await ResellerService.requestPayout(resellerId, amount, paymentDetails);

        // 2. Update Method
        await prisma.resellerPayoutRequest.update({
            where: { id: request.id },
            data: { payment_method: paymentMethod }
        });

        return NextResponse.json({
            success: true,
            message: "Payout request submitted successfully. It will be reviewed by our finance team.",
            data: request
        });

    } catch (error: any) {
        console.error("Payout Submission Error:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}

/**
 * List payout history for a reseller
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const resellerId = searchParams.get('resellerId');

        if (!resellerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payouts = await prisma.resellerPayoutRequest.findMany({
            where: { reseller_id: resellerId },
            orderBy: { created_at: 'desc' }
        });

        return NextResponse.json({ success: true, data: payouts });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to load payouts" }, { status: 500 });
    }
}
