import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import crypto from "crypto";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user?.workspaceId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const newKey = "wabot_" + crypto.randomBytes(32).toString('hex');

        await prisma.workspace.update({
            where: { id: user.workspaceId },
            data: { api_key: newKey }
        });

        return NextResponse.json({ success: true, apiKey: newKey });
    } catch (error) {
        console.error("POST /api/settings/api-keys/generate error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
