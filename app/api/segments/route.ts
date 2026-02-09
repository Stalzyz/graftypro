
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const segments = await prisma.segment.findMany({
            where: { workspace_id: user.workspaceId },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json({ data: segments });
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { name, description, filters } = await req.json();

        if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

        const segment = await prisma.segment.create({
            data: {
                workspace_id: user.workspaceId,
                name,
                description,
                filters: filters || {}
            }
        });

        return NextResponse.json({ data: segment });
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
