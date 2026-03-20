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

        // Removed the free credits offering
        if (offer === "credits") {
            // Keep this for backward compatibility if called, but do nothing.
            console.log("Welcome offer for credits was claimed, but free credits are now disabled.");
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Claim Offer Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
