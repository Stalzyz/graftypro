
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const p = prisma as any;
        const pages = await p.landingPage.findMany({
            orderBy: { created_at: 'desc' }
        });
        return NextResponse.json({ success: true, data: pages });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch pages" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'SUPER_ADMIN') {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const p = prisma as any;
        const body = await req.json();
        const { title, slug } = body;

        const page = await p.landingPage.create({
            data: {
                title,
                slug,
            }
        });

        return NextResponse.json({ success: true, data: page });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create page" }, { status: 500 });
    }
}
