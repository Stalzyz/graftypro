import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const workspace = await prisma.workspace.findUnique({
            where: { id: user.workspaceId },
            select: { settings: true }
        });

        if (!workspace) return NextResponse.json({ error: "Workspace not found" }, { status: 404 });

        const settings = (workspace.settings as any) || {};
        return NextResponse.json({ emails: settings.payment_notification_emails || [] });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { emails } = body;

        if (!Array.isArray(emails)) {
            return NextResponse.json({ error: "Invalid emails array" }, { status: 400 });
        }

        const workspace = await prisma.workspace.findUnique({
            where: { id: user.workspaceId },
            select: { settings: true }
        });

        const currentSettings = (workspace?.settings as any) || {};
        const newSettings = { ...currentSettings, payment_notification_emails: emails };

        await prisma.workspace.update({
            where: { id: user.workspaceId },
            data: { settings: newSettings }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
