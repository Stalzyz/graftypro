
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Verify ownership
        const flow = await prisma.flow.findUnique({
            where: { id: params.id }
        });

        if (!flow || flow.workspace_id !== user.workspaceId) {
            return NextResponse.json({ error: "Flow not found" }, { status: 404 });
        }

        const analytics = await prisma.flowAnalytics.findMany({
            where: { flow_id: params.id }
        });

        return NextResponse.json({ data: analytics });
    } catch (error) {
        return NextResponse.json({ error: "Error fetching analytics" }, { status: 500 });
    }
}
