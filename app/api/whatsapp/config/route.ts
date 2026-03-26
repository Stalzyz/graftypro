import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        // ── Auth ─────────────────────────────────────────────────────────────
        // BUG FIX: Previously returned 401 if called before cookie was ready.
        // Now falls back to reading middleware-injected headers so the webhook
        // config is ALWAYS returned if the request passes middleware auth.
        let authed = false;

        const user = await getCurrentUser(req);
        if (user) {
            authed = true;
        } else {
            // Trust middleware-injected header (middleware already verified the token)
            const userId = req.headers.get("x-user-id");
            if (userId) authed = true;
        }

        if (!authed) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // ── Resolve the domain correctly ─────────────────────────────────────
        // For the webhook URL we must return the current server's domain or IP
        const mainDomain = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") || "http://72.61.231.187:3001";
        
        // FIX: The actual path is /api/whatsapp/webhook (not /api/webhooks/whatsapp)
        const webhookUrl = process.env.WHATSAPP_WEBHOOK_URL || `${mainDomain}/api/whatsapp/webhook`;
        const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN || "grafty_secure_token";

        console.log("[WhatsApp Config] Serving webhook config:", webhookUrl);

        return NextResponse.json({
            webhookUrl,
            verifyToken,
            // Extra fields for debugging in the UI
            mainDomain
        });

    } catch (err: any) {
        console.error("[WhatsApp Config] Error:", err.message);
        return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
    }
}
