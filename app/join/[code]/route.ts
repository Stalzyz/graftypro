
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * PHASE: RESELLER ONBOARDING
 * Catch-all route for referral links: join/[code]
 * Sets the partner cookie and redirects to signup.
 */
export async function GET(
    request: Request,
    { params }: { params: { code: string } }
) {
    const code = params.code;

    // Resolve correct base URL for production
    const protocol = request.headers.get("x-forwarded-proto") || "http";
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "grafty.pro";
    const baseUrl = `${protocol}://${host}`;

    console.log(`🔗 Referral Join: ${code} on ${baseUrl}`);

    const response = NextResponse.redirect(new URL("/register", baseUrl));

    // Set referral cookie for 7 days
    response.cookies.set("res_referral_code", code, {
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax"
    });

    return response;
}
