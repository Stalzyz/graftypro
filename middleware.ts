import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

export function middleware(request: NextRequest) {
    // 1. Define guarded paths
    const path = request.nextUrl.pathname;

    // Public paths
    if (
        path.startsWith("/api/auth") ||
        path.startsWith("/_next") ||
        path === "/" ||
        path === "/login" ||
        path === "/register" ||
        path.includes("favicon")
    ) {
        return NextResponse.next();
    }

    // 2. Validate Token
    // Note: We'll look for token in Header (API) or Cookie (UI)
    // For this MVP step, we assume client sends Authorization header for API calls
    // or we can implement cookie parsing if we build the UI now. Let's support Header mainly for the API specs.

    const authHeader = request.headers.get("Authorization");

    // Check token presence
    // (In real app, also check cookies for frontend navigation)
    let token = "";

    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
    } else {
        // Attempt cookie check (future proofing)
        // token = request.cookies.get("token")?.value || "";
    }

    if (!token) {
        if (path.startsWith("/api")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        } else {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // 3. Verify Token
    const payload = verifyToken(token);
    if (!payload) {
        if (path.startsWith("/api")) {
            return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
        } else {
            return NextResponse.redirect(new URL("/login", request.url));
        }
    }

    // 4. Inject User Context into Headers for Downstream (API Routes)
    // Next.js middleware cannot modify the "request" object passed to routes directly in the same way Express does,
    // but we can set custom headers.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-workspace-id", payload.workspaceId);
    requestHeaders.set("x-user-role", payload.role);

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api/auth (auth routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
    ],
};
