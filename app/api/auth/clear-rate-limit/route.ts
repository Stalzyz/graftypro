
import { NextResponse } from "next/server";
import { redis } from "../../../../lib/redis";

/**
 * Clears rate limit for a specific IP or all login attempts.
 * POST /api/auth/clear-rate-limit
 * Body: { ip: "x.x.x.x" }  or {} to clear all
 * REMOVE ONCE DEBUGGING IS COMPLETE.
 */
export async function POST(request: Request) {
    try {
        const body = await request.json().catch(() => ({}));
        const { ip } = body;

        if (ip) {
            await redis.del(`rate_limit:login:${ip}`);
            return NextResponse.json({ success: true, message: `Cleared rate limit for IP: ${ip}` });
        }

        // Clear all login rate limits (scan for keys with pattern)
        const keys = await redis.keys("rate_limit:login:*");
        if (keys.length > 0) {
            await redis.del(...keys);
        }
        return NextResponse.json({ success: true, message: `Cleared ${keys.length} rate limit entries` });
    } catch (e: any) {
        return NextResponse.json({ error: `Failed: ${e.message}` }, { status: 500 });
    }
}
