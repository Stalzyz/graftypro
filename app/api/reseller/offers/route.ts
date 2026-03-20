
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const resellerId = req.headers.get("x-reseller-id");
        if (!resellerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const offers = await prisma.resellerOffer.findMany({
            where: { reseller_id: resellerId },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json({ success: true, data: offers });
    } catch (error: any) {
        console.error("Reseller Offers GET Error:", error);
        return NextResponse.json({ error: "Failed to load offers" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const resellerId = req.headers.get("x-reseller-id");
        if (!resellerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { title, description, offerType, planId, discountCode, validUntil } = await req.json();

        if (!title || !offerType) {
            return NextResponse.json({ error: "Title and Offer Type are required" }, { status: 400 });
        }

        const shareLink = `PROMO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const offer = await prisma.resellerOffer.create({
            data: {
                reseller_id: resellerId,
                title,
                description,
                offer_type: offerType,
                plan_id: planId,
                discount_code: discountCode,
                valid_until: validUntil ? new Date(validUntil) : null,
                share_link: shareLink
            }
        });

        return NextResponse.json({ success: true, data: offer });
    } catch (error: any) {
        console.error("Reseller Offers POST Error:", error);
        return NextResponse.json({ error: "Failed to create offer" }, { status: 500 });
    }
}
