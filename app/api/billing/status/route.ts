
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const workspace = await prisma.workspace.findUnique({
            where: { id: user.workspaceId },
            select: { plan: true, subscription_status: true }
        });

        return NextResponse.json({
            plan: workspace?.plan || "FREE",
            status: workspace?.subscription_status
        });

    } catch (error) {
        return NextResponse.json({ error: "Error fetching status" }, { status: 500 });
    }
}
