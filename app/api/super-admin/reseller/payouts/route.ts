
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { ResellerService } from "../../../../../lib/reseller/service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const payouts = await prisma.resellerPayoutRequest.findMany({
            include: {
                reseller: {
                    select: { name: true, email: true, wallet_balance: true }
                }
            },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json({ payouts });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch payouts" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { requestId, action, adminNotes } = await req.json();

        if (!requestId || !action) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const result = await ResellerService.processAdminPayoutAction(requestId, action, adminNotes);

        return NextResponse.json(result);

    } catch (error: any) {
        console.error("Admin Payout Error:", error.message);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
}
