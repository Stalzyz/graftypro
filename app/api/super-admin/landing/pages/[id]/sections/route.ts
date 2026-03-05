
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const p = prisma as any;
        const sections = await p.landingSection.findMany({
            where: { page_id: params.id },
            orderBy: { order: 'asc' }
        });
        return NextResponse.json({ success: true, data: sections });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch sections" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const p = prisma as any;
        const body = await req.json();
        const { type, content, order } = body;

        const section = await p.landingSection.create({
            data: {
                page_id: params.id,
                type,
                content,
                order: order || 0
            }
        });

        // Set page to draft when edited
        await p.landingPage.update({
            where: { id: params.id },
            data: { status: 'DRAFT' }
        });

        return NextResponse.json({ success: true, data: section });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create section" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { sections } = body; // Array of sections with id and order

    try {
        const p = prisma as any;
        await p.$transaction(
            sections.map((s: any) =>
                p.landingSection.update({
                    where: { id: s.id },
                    data: { order: s.order, content: s.content, is_active: s.is_active }
                })
            )
        );

        await p.landingPage.update({
            where: { id: params.id },
            data: { status: 'DRAFT' }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update sections" }, { status: 500 });
    }
}
