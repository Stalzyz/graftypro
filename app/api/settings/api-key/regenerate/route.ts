import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

        const newKey = `gf_${crypto.randomBytes(24).toString("hex")}`;

        await prisma.workspace.update({
            where: { id: user.workspaceId },
            data: { api_key: newKey }
        });

        return NextResponse.json({ success: true, apiKey: newKey });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
