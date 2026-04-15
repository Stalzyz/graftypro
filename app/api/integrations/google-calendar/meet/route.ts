import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCurrentUser } from "../../../../../lib/auth";
import { GoogleCalendarService } from "../../../../../lib/google/calendar-service";

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const name = searchParams.get("name") || "Client Meeting";

        let meetLink = null;
        let isFallback = false;

        // Path A: Try Google Calendar API
        try {
            meetLink = await GoogleCalendarService.createInstantMeeting(user.workspaceId, name);
        } catch (apiError: any) {
            console.log("[Meet API] Google API failed or not connected, trying fallback:", apiError.message);
        }

        // Path B: Fallback to Manual Link
        if (!meetLink) {
            const workspace = await prisma.workspace.findUnique({
                where: { id: user.workspaceId },
                select: { settings: true }
            });
            const settings = (workspace?.settings as any) || {};
            meetLink = settings.fallbackMeetLink;
            if (meetLink) isFallback = true;
        }

        if (!meetLink) {
            return NextResponse.json({ 
                error: "No meeting link available. Please connect Google Calendar OR provide a manual link in Settings > Integrations." 
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            link: meetLink,
            method: isFallback ? "manual" : "automated"
        });
    } catch (error: any) {
        console.error("[Meet API] Critical Error:", error.message);
        return NextResponse.json({ 
            error: error.message || "Failed to generate meeting link" 
        }, { status: 500 });
    }
}
