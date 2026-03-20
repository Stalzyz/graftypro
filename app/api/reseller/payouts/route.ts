import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getResellerSession } from "@/lib/reseller/auth-helper";
import { ResellerService } from "@/lib/reseller/service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payouts = await prisma.resellerPayoutRequest.findMany({
            where: { reseller_id: session.userId },
            orderBy: { created_at: "desc" }
        });

        const formattedPayouts = payouts.map(p => ({
            ...p,
            amount: Number(p.amount || 0)
        }));

        return NextResponse.json({ success: true, data: formattedPayouts });
    } catch (error) {
        return NextResponse.json({ error: "Failed to load payouts" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { amount, method, account_details } = await req.json();

        // Check for bank details
        const reseller = await prisma.reseller.findUnique({
            where: { id: session.userId },
            select: { bank_account_number: true, bank_ifsc: true }
        });

        if (!reseller?.bank_account_number || !reseller?.bank_ifsc) {
            return NextResponse.json({ 
                error: "Bank details missing. Please setup your bank account in Reseller Portal -> Payouts -> Edit Details." 
            }, { status: 400 });
        }

        const request = await ResellerService.requestPayout(
            session.userId,
            Number(amount),
            account_details || {}
        );

        return NextResponse.json({ 
            success: true, 
            data: {
                ...request,
                amount: Number(request.amount || 0)
            } 
        });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create payout request" }, { status: 500 });
    }
}
