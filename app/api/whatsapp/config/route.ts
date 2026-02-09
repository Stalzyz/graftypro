import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        return NextResponse.json({
            webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.grekam.in'}/api/webhooks/whatsapp`,
            verifyToken: process.env.META_WEBHOOK_VERIFY_TOKEN || "wabot_verification_token"
        });
    } catch (err) {
        return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
    }
}
