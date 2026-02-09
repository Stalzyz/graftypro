
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        const body = await req.json();
        const { name, role, content, rating, reseller_id } = body;

        if (!name || !content) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const feedback = await prisma.feedback.create({
            data: {
                name,
                role: role || (user?.role === 'RESELLER' ? 'RESELLER' : 'VENDOR'),
                content,
                rating: rating || 5,
                workspace_id: user?.workspaceId || null,
                reseller_id: reseller_id || (user?.role === 'RESELLER' ? user.reseller_id : null),
                is_approved: false // Mandatory approval from Super Admin
            }
        });

        return NextResponse.json({ success: true, data: feedback });
    } catch (e: any) {
        console.error("Feedback submission error", e);
        return NextResponse.json({ error: e.message || "Failed to submit feedback" }, { status: 500 });
    }
}

export async function GET() {
    try {
        const feedbacks = await prisma.feedback.findMany({
            where: { is_approved: true },
            orderBy: { created_at: 'desc' },
            take: 10
        });
        return NextResponse.json({ data: feedbacks });
    } catch (e: any) {
        return NextResponse.json({ error: "Failed to fetch feedbacks" }, { status: 500 });
    }
}
