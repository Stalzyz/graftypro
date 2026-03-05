import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const forms = await prisma.eduForm.findMany({
            where: { workspace_id: user.workspaceId },
            include: { _count: { select: { leads: true } } },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json({ data: forms });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { name, type, fields, success_msg } = body;

        const form = await prisma.eduForm.create({
            data: {
                workspace_id: user.workspaceId,
                name,
                type: type || "INQUIRY",
                fields: fields || [],
                success_msg: success_msg || "Thank you for your inquiry. Our counselor will contact you shortly."
            }
        });

        return NextResponse.json({ success: true, data: form });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
