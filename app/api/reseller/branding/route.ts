import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getResellerSession } from "../../../../lib/reseller/auth-helper";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const reseller = await prisma.reseller.findUnique({
            where: { id: session.userId },
            select: {
                brand_name: true,
                logo_url: true,
                favicon_url: true,
                primary_color: true,
                secondary_color: true,
                support_email: true,
                support_url: true,
                custom_domain: true,
                smtp_config: true,
                // @ts-ignore
                role: true
            }
        });

        if (!reseller) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        // Allow any partner role to READ branding
        return NextResponse.json({ data: reseller });

    } catch (error) {
        console.error("GET Branding Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            brand_name, logo_url, favicon_url, primary_color, secondary_color,
            support_email, support_url,
            custom_domain, smtp_config, domain_verified
        } = body;

        // Build update payload — only include fields that were sent
        const updateData: any = {};
        if (brand_name !== undefined) updateData.brand_name = brand_name;
        if (logo_url !== undefined) updateData.logo_url = logo_url;
        if (favicon_url !== undefined) updateData.favicon_url = favicon_url;
        if (primary_color !== undefined) updateData.primary_color = primary_color;
        if (secondary_color !== undefined) updateData.secondary_color = secondary_color;
        if (support_email !== undefined) updateData.support_email = support_email;
        if (support_url !== undefined) updateData.support_url = support_url;
        if (custom_domain !== undefined) updateData.custom_domain = custom_domain || null;
        if (smtp_config !== undefined) updateData.smtp_config = smtp_config;
        if (domain_verified !== undefined) updateData.domain_verified = domain_verified;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        const updated = await prisma.reseller.update({
            where: { id: session.userId },
            data: updateData
        });

        return NextResponse.json({ success: true, data: updated });

    } catch (error) {
        console.error("Update Branding Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
