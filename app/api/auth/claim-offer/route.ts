import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "../../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const token = cookies().get("token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

        const body = await req.json();
        const { offer } = body;

        await prisma.user.update({
            where: { id: payload.userId },
            data: {
                welcome_offer_claimed: true
            }
        });

        // Add 500 Credits if selected
        if (offer === "credits") {
            const wallet = await prisma.vendorWallet.findUnique({
                where: { workspace_id: payload.workspaceId }
            });

            if (wallet) {
                await prisma.vendorWallet.update({
                    where: { workspace_id: payload.workspaceId },
                    data: {
                        current_balance: { increment: 500 }
                    }
                });

                // Track in Transaction
                await prisma.creditTransaction.create({
                    data: {
                        workspace_id: payload.workspaceId,
                        wallet_id: wallet.id,
                        amount: 500,
                        type: "PURCHASE",
                        description: "Welcome Offer: 500 Free Credits",
                        status: "COMPLETED",
                        balance_before: wallet.current_balance,
                        balance_after: Number(wallet.current_balance) + 500
                    }
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Claim Offer Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
