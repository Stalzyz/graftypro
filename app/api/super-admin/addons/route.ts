import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await requireSuperAdmin();
        const addons = await prisma.addon.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json({ data: addons });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 401 });
    }
}

export async function PATCH(req: Request) {
    try {
        await requireSuperAdmin();
        const body = await req.json();
        const { id, price, is_active, title, description } = body;

        if (!id) return NextResponse.json({ error: "Addon ID required" }, { status: 400 });

        const updatedAddon = await prisma.addon.update({
            where: { id },
            data: {
                ...(price !== undefined && { price: parseFloat(price) }),
                ...(is_active !== undefined && { is_active }),
                ...(title && { title }),
                ...(description && { description }),
            }
        });

        return NextResponse.json({ success: true, data: updatedAddon });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
