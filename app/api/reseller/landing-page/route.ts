import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getResellerSession } from "@/lib/reseller/auth-helper";

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
                home_page_type: true,
                external_home_url: true,
                custom_home_html: true,
            } as any
        });

        if (!reseller) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json({ data: reseller });

    } catch (error) {
        console.error("GET Landing Page Settings Error:", error);
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
        const { home_page_type, external_home_url, custom_home_html } = body;

        const updateData: any = {};
        if (home_page_type !== undefined) updateData.home_page_type = home_page_type;
        if (external_home_url !== undefined) updateData.external_home_url = external_home_url;
        if (custom_home_html !== undefined) updateData.custom_home_html = custom_home_html;

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        const updated = await prisma.reseller.update({
            where: { id: session.userId },
            data: updateData as any
        });

        return NextResponse.json({ success: true, data: updated });

    } catch (error) {
        console.error("Update Landing Page Settings Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
