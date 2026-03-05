import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";
import { EduBroadcastService } from "../../../../lib/edu/broadcast";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { name, templateName, targetStatus, course } = await req.json();

        const broadcast = await EduBroadcastService.createBroadcast(user.workspaceId, {
            name,
            templateName,
            targetStatus,
            course
        });

        return NextResponse.json({ success: true, data: broadcast });
    } catch (error: any) {
        console.error("Edu Broadcast Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
