
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AuthSecurityService } from "../../../../lib/security/auth-utils";
import { getCurrentUser, verifyToken } from "../../../../lib/auth";

export async function POST(request: Request) {
    const _cookieStore = cookies();
    const _token = _cookieStore.get("token")?.value;
    const user = _token ? await verifyToken(_token) : null;

    const response = NextResponse.json({ success: true, redirect: "/login" });

    // Clear Cookie
    response.cookies.set("token", "", {
        httpOnly: true,
        expires: new Date(0),
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production"
    });

    if (user) {
        // Log Logout
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        await AuthSecurityService.logEvent({
            userId: user.userId,
            email: user.email || "unknown", // Payload might not have email depending on implementation
            action: "LOGOUT",
            status: "SUCCESS",
            ipAddress: ip,
            userAgent: request.headers.get("user-agent") || undefined
        });
    }

    return response;
}
