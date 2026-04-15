import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCurrentUser } from "../../../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const workspace = await prisma.workspace.findUnique({
            where: { id: user.workspaceId },
            select: { settings: true }
        });

        const settings = (workspace?.settings as any) || {};
        return NextResponse.json({ 
            success: true, 
            link: settings.fallbackMeetLink || "" 
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { link } = await request.json();

        const workspace = await prisma.workspace.findUnique({
            where: { id: user.workspaceId },
            select: { settings: true }
        });

        const settings = (workspace?.settings as any) || {};
        const updatedSettings = {
            ...settings,
            fallbackMeetLink: link
        };

        await prisma.workspace.update({
            where: { id: user.workspaceId },
            data: { settings: updatedSettings }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
