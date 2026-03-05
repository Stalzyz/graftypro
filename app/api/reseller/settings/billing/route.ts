import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getResellerSession } from "../../../../../lib/reseller/auth-helper";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { payment_gateways } = body;

        if (!Array.isArray(payment_gateways)) {
            return NextResponse.json({ error: "Invalid payment gateway format." }, { status: 400 });
        }

        // Validate structure
        for (const gw of payment_gateways) {
            if (!gw.provider || !gw.key_id || !gw.key_secret) {
                return NextResponse.json({ error: "Incomplete gateway configuration. Missing provider, key ID, or secret." }, { status: 400 });
            }
        }

        // Store in DB
        await prisma.reseller.update({
            where: { id: session.userId },
            data: {
                payment_gateways: payment_gateways
            }
        });

        return NextResponse.json({ success: true, message: "Payment configurations synchronized." });

    } catch (error) {
        console.error("Payment Gateway Sync Error:", error);
        return NextResponse.json({ error: "Failed to persist gateway settings." }, { status: 500 });
    }
}
