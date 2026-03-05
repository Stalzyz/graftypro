import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getResellerSession } from "../../../../lib/reseller/auth-helper";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payouts = await prisma.resellerPayoutRequest.findMany({
            where: { reseller_id: session.userId },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json({ success: true, data: payouts });
    } catch (error) {
        return NextResponse.json({ error: "Failed to load payouts" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { amount, method, account_details } = await req.json();

        if (!amount || amount <= 0) {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }

        const reseller = await prisma.reseller.findUnique({
            where: { id: session.userId },
            select: { wallet_balance: true }
        });

        if (!reseller || Number(reseller.wallet_balance) < amount) {
            return NextResponse.json({ error: "Insufficient wallet balance" }, { status: 400 });
        }

        const request = await prisma.resellerPayoutRequest.create({
            data: {
                reseller_id: session.userId,
                amount,
                method: method || "BANK_TRANSFER",
                account_details: account_details || {},
                status: "PENDING"
            }
        });

        return NextResponse.json({ success: true, data: request });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create payout request" }, { status: 500 });
    }
}
