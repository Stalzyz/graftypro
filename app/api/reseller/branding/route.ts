import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * PHASE 1: CUSTOM BRANDING API
 * Allows resellers to manage their white-label settings.
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const resellerId = searchParams.get('resellerId');

        if (!resellerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const reseller = await prisma.reseller.findUnique({
            where: { id: resellerId },
            select: {
                brand_name: true,
                logo_url: true,
                favicon_url: true,
                primary_color: true,
                secondary_color: true,
                custom_domain: true,
                broadcast_banner: true,
                broadcast_link: true,
                support_email: true,
                support_url: true,
                markup_percentage: true
            }
        });

        return NextResponse.json({ success: true, data: reseller });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to load branding" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            resellerId,
            brand_name,
            logo_url,
            favicon_url,
            primary_color,
            secondary_color,
            custom_domain,
            broadcast_banner,
            broadcast_link,
            support_email,
            support_url,
            markup_percentage
        } = body;

        if (!resellerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const updated = await prisma.reseller.update({
            where: { id: resellerId },
            data: {
                brand_name,
                logo_url,
                favicon_url,
                primary_color,
                secondary_color,
                custom_domain,
                broadcast_banner,
                broadcast_link,
                support_email,
                support_url,
                markup_percentage
            }
        });

        return NextResponse.json({ success: true, data: updated });
    } catch (error: any) {
        console.error("Branding Update Error:", error);
        return NextResponse.json({ error: "Failed to update branding" }, { status: 500 });
    }
}
