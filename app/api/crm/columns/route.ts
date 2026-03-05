import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const columns = await prisma.universalCrmColumn.findMany({
            where: { workspace_id: user.workspaceId },
            orderBy: { order: "asc" }
        });

        return NextResponse.json(columns);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();

        // Convert name to normalized key if not provided
        const key = body.key || body.name.toLowerCase().replace(/[^a-z0-9]/g, '_');

        const column = await prisma.universalCrmColumn.create({
            data: {
                workspace_id: user.workspaceId,
                name: body.name,
                key: key,
                type: body.type || 'TEXT',
                is_required: body.is_required || false,
                is_visible: body.is_visible !== false, // default true
                options: body.options ? JSON.parse(JSON.stringify(body.options)) : null,
                default_val: body.default_val || null,
                order: body.order || 0
            }
        });

        return NextResponse.json(column);
    } catch (error: any) {
        console.error("CRM Column Error:", error);
        if (error.code === 'P2002') return NextResponse.json({ error: "Column key already exists" }, { status: 400 });
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
