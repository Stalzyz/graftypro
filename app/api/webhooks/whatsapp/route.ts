import { GET as hardenedGET, POST as hardenedPOST } from "../../whatsapp/webhook/route";

/**
 * 🛰️ UNIVERSAL WEBHOOK ALIAS (FOR LOCKED-OUT USERS)
 * This file lives at /api/webhooks/whatsapp (The previous typoed path).
 * It forwards all traffic to the hardened /api/whatsapp/webhook logic.
 */

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    console.log("📡 [ALIAS_GET] Catching verification ping from legacy path...");
    return hardenedGET(req);
}

export async function POST(req: Request) {
    // Read raw body once
    const rawBody = await req.text();
    console.log(`\n🚨 [ALIAS_POST_HIT] Caught incoming message at legacy path!`);
    console.log(`📦 [ALIAS_PAYLOAD] ${rawBody.slice(0, 1000)}`);

    try {
        const fs = require('fs');
        fs.appendFileSync('/app/public/uploads/webhook_hits.txt', `\n[${new Date().toISOString()}] ALIAS_HIT: ${rawBody.slice(0, 500)}`);
    } catch (e) {} // Ignore if local dev environment doesn't match

    // Reconstruct request for the hardened controller
    const forwardedReq = new Request(req.url, {
        method: "POST",
        headers: req.headers,
        body: rawBody
    });

    return hardenedPOST(forwardedReq);
}

