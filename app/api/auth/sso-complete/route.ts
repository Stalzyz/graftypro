/**
 * SSO Handoff Endpoint
 *
 * Receives a JWT from the main platform's Google OAuth callback,
 * validates it, sets the cookie on the CURRENT domain (partner domain),
 * and redirects to the dashboard.
 *
 * KEY FIX: cookie sameSite is always "lax" — never "none" without secure=true.
 */

import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

function detectProtocol(request: Request): "https" | "http" {
    const forwarded = request.headers.get("x-forwarded-proto");
    if (forwarded === "https") return "https";
    if (forwarded === "http") return "http";
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    if (host.includes("localhost") || /^\d+\.\d+\.\d+\.\d+/.test(host.split(":")[0])) return "http";
    return "https";
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const ssoToken = searchParams.get("token");
    const tokenType = searchParams.get("type") || "token";

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const protocol = detectProtocol(request);
    const isHttps = protocol === "https";
    const baseUrl = `${protocol}://${host}`;

    if (!ssoToken) {
        console.error("[SSO Handoff] No token provided");
        return NextResponse.redirect(new URL("/login?error=sso_failed", baseUrl));
    }

    try {
        const payload = await verifyToken(ssoToken);

        if (!payload?.userId) {
            console.error("[SSO Handoff] Invalid or expired SSO token");
            return NextResponse.redirect(new URL("/login?error=sso_expired", baseUrl));
        }

        const dashboardPath = payload.role === "RESELLER" ? "/partner/dashboard" : "/dashboard";
        console.log(`[SSO Handoff] ✅ Setting cookie for ${payload.userId} on ${host} → ${dashboardPath}`);

        // CRITICAL FIX: sameSite lax works on both HTTP and HTTPS.
        // sameSite=none requires secure=true or browsers will REJECT the cookie silently.
        const cookieOptions = {
            httpOnly: true,
            secure: isHttps,
            sameSite: "lax" as const,
            path: "/",
            maxAge: 60 * 60 * 24 * 7,
        };

        const response = NextResponse.redirect(new URL(dashboardPath, baseUrl));
        const cookieName = tokenType === "partner_token" ? "partner_token" : "token";
        response.cookies.set(cookieName, ssoToken, cookieOptions);

        return response;

    } catch (err: any) {
        console.error("[SSO Handoff] Fatal error:", err?.message);
        return NextResponse.redirect(new URL("/login?error=sso_error", baseUrl));
    }
}
