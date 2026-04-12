import { GET as hardenedGET, POST as hardenedPOST } from "../../whatsapp/webhook/route";

/**
 * 🛰️ UNIVERSAL WEBHOOK ALIAS (FOR LOCKED-OUT USERS)
 * This file lives at /api/webhooks/whatsapp (The previous typoed path).
 * It forwards all traffic to the hardened /api/whatsapp/webhook logic.
 *
 * Bug #4 Fix:
 *  - Explicitly set Content-Type: application/json on forwarded request so
 *    the downstream req.json() call never fails due to a missing header.
 *  - Return 200 to Meta even if the inner handler throws, preventing infinite
 *    retries that would clog the queue. Errors are still logged for debugging.
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

    // Bug #4 Fix: Reconstruct request WITH explicit Content-Type so that
    // the downstream req.json() does not fail due to a missing header.
    const forwardedHeaders = new Headers(req.headers);
    forwardedHeaders.set("Content-Type", "application/json");

    const forwardedReq = new Request(req.url, {
        method: "POST",
        headers: forwardedHeaders,
        body: rawBody
    });

    try {
        return await hardenedPOST(forwardedReq);
    } catch (innerErr: any) {
        // Bug #4 Fix: Never return 500 to Meta — it would trigger endless retries
        // that permanently lose messages. Log the failure and ack Meta with 200.
        console.error("❌ [ALIAS_INNER_FAIL] Hardened handler threw an error:", innerErr?.message);
        return new Response(JSON.stringify({ status: "ack", note: "inner_handler_error" }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });
    }
}

