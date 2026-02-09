
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyToken } from "@/lib/auth"; // Assume this exists and works

export async function GET() {
    try {
        const config = await prisma.systemConfig.findUnique({
            where: { id: "global" }
        });
        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const config = await prisma.systemConfig.upsert({
            where: { id: "global" },
            update: body,
            create: {
                id: "global",
                ...body
            }
        });
        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
    }
}
