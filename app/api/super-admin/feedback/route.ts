
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Mock Super Admin check - in real app, verify Admin JWT
async function checkSuperAdmin(req: Request) {
    // Implement actual session check
    return true;
}

export async function GET(req: Request) {
    if (!await checkSuperAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const feedbacks = await prisma.feedback.findMany({
            orderBy: { created_at: 'desc' }
        });
        return NextResponse.json({ data: feedbacks });
    } catch (e) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    if (!await checkSuperAdmin(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id, approve, delete: shouldDelete } = await req.json();

        if (shouldDelete) {
            await prisma.feedback.delete({ where: { id } });
            return NextResponse.json({ success: true, message: "Deleted" });
        }

        const feedback = await prisma.feedback.update({
            where: { id },
            data: { is_approved: approve }
        });

        return NextResponse.json({ success: true, data: feedback });
    } catch (e) {
        return NextResponse.json({ error: "Failed to process" }, { status: 500 });
    }
}
