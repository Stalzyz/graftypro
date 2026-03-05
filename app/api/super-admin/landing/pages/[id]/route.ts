
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const p = prisma as any;
        const page = await p.landingPage.findUnique({
            where: { id: params.id },
            include: {
                sections: {
                    orderBy: { order: 'asc' }
                }
            }
        });
        return NextResponse.json({ success: true, data: page });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch page" }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const p = prisma as any;
        const body = await req.json();
        const page = await p.landingPage.update({
            where: { id: params.id },
            data: {
                ...body,
                status: 'DRAFT'
            }
        });
        return NextResponse.json({ success: true, data: page });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const p = prisma as any;
        await p.landingPage.delete({ where: { id: params.id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to delete page" }, { status: 500 });
    }
}
