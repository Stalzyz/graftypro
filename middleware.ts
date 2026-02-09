import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";

export async function middleware(request: NextRequest) {
    // 0. CUSTOM DOMAIN ROUTING (Phase 3: Custom Branding)
    const host = request.headers.get("host") || "";
    const isMainDomain = host === process.env.NEXT_PUBLIC_MAIN_DOMAIN || host.includes("localhost");

    // Inject Custom Domain context for the Branding Resolver
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-request-host", host);

    // 1. Define guarded paths
    const path = request.nextUrl.pathname;

    // --------------------------------------------------------
    // SUPER ADMIN PROTECTION
    // --------------------------------------------------------
    if (path.startsWith("/super-admin") || path.startsWith("/api/super-admin")) {
        // Exclude Login Path
        if (
            path === "/super-admin/login" ||
            path === "/api/super-admin/auth/login"
        ) {
            return NextResponse.next({ request: { headers: requestHeaders } });
        }

        const adminToken = request.cookies.get("admin_token")?.value;
        if (!adminToken) {
            if (path.startsWith("/api")) {
                return NextResponse.json({ error: "Unauthorized Admin" }, { status: 401 });
            }
            return NextResponse.redirect(new URL("/super-admin/login", request.url));
        }

        const { verifyAdminToken } = await import("./lib/admin-auth");
        const adminPayload = await verifyAdminToken(adminToken);

        if (!adminPayload) {
            if (path.startsWith("/api")) {
                return NextResponse.json({ error: "Invalid Admin Session" }, { status: 401 });
            }
            return NextResponse.redirect(new URL("/super-admin/login", request.url));
        }

        // Allow Admin
        return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // --------------------------------------------------------
    // RESELLER PORTAL PROTECTION
    // --------------------------------------------------------
    if (path.startsWith("/partner") || path.startsWith("/api/reseller")) {
        // Exclude Login Path
        if (
            path === "/partner/login" ||
            path === "/api/reseller/auth/login"
        ) {
            return NextResponse.next({ request: { headers: requestHeaders } });
        }

        const partnerToken = request.cookies.get("partner_token")?.value;
        if (!partnerToken) {
            if (path.startsWith("/api")) {
                return NextResponse.json({ error: "Unauthorized Partner" }, { status: 401 });
            }
            return NextResponse.redirect(new URL("/partner/login", request.url));
        }

        const payload = await verifyToken(partnerToken);
        if (!payload || !payload.resellerId) {
            if (path.startsWith("/api")) {
                return NextResponse.json({ error: "Invalid Partner Session" }, { status: 401 });
            }
            return NextResponse.redirect(new URL("/partner/login", request.url));
        }

        // Inject Reseller Header
        requestHeaders.set("x-reseller-id", payload.resellerId);
        return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // --------------------------------------------------------
    // STANDARD APP PROTECTION
    // --------------------------------------------------------

    // Public paths
    if (
        path.startsWith("/api/auth") ||
        path.startsWith("/_next") ||
        path.startsWith("/landing") ||
        path.startsWith("/docs") ||
        path === "/" ||
        path === "/login" ||
        path === "/register" ||
        path.startsWith("/api/webhooks") ||
        path.startsWith("/api/edu/leads/capture") ||
        path.includes("favicon")
    ) {
        return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // ... validate standard token ...
    const authHeader = request.headers.get("Authorization");
    let token = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : request.cookies.get("token")?.value || "";

    if (!token) {
        if (path.startsWith("/api")) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }

    const payload = await verifyToken(token);
    if (!payload) {
        if (path.startsWith("/api")) {
            return NextResponse.json({ error: "Invalid Token" }, { status: 401 });
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // Inject Auth Headers
    requestHeaders.set("x-user-id", payload.userId);
    requestHeaders.set("x-workspace-id", payload.workspaceId);
    requestHeaders.set("x-user-role", payload.role);

    return NextResponse.next({
        request: { headers: requestHeaders }
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
