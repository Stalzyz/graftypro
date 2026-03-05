import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user?.workspaceId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const workspace = await prisma.workspace.findUnique({
            where: { id: user.workspaceId },
            select: { api_key: true, webhook_url: true }
        });

        if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

        return NextResponse.json({
            apiKey: workspace.api_key,
            webhookUrl: workspace.webhook_url
        });
    } catch (error) {
        console.error("GET /api/settings/api-keys error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user?.workspaceId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { webhookUrl } = await req.json();

        await prisma.workspace.update({
            where: { id: user.workspaceId },
            data: { webhook_url: webhookUrl }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("POST /api/settings/api-keys error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
