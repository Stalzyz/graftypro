import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";
import { verifyAdminToken } from "./lib/admin-auth-core";

// DEBUG LOGGING
function logRequest(req: NextRequest, status: string) {
    // console.log(`[Middleware] ${req.method} ${req.nextUrl.pathname} -> ${status}`);
}

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const host = request.headers.get("host") || "";
    console.log(`[DEBUG] Middleware Path: ${path}`);
    // 0. GLOBAL CONTEXT

    // Redirect legacy paths to new Partner Program pages
    const legacyRedirects: Record<string, string> = {
        "/reseller/apply": "/affiliate-partner",
        "/reseller-program": "/affiliate-partner",
        "/reseller": "/affiliate-partner",
        "/white-label": "/platform-partner",
        "/landing/reseller": "/affiliate-partner",
        "/landing/white-label": "/platform-partner"
    };

    if (legacyRedirects[path]) {
        const protocol = request.headers.get("x-forwarded-proto") || "https";
        const baseHost = (process.env.NODE_ENV === "production" && host.includes("localhost")) ? "grafty.pro" : host;
        return NextResponse.redirect(new URL(`${protocol}://${baseHost}${legacyRedirects[path]}`));
    }

    const requestHeaders = new Headers(request.headers);

    // Inject Custom Domain context
    const testHost = request.headers.get("x-request-host");
    if (host.includes("localhost") && testHost) {
        requestHeaders.set("x-request-host", testHost);
    } else {
        requestHeaders.set("x-request-host", host);
    }

    // --------------------------------------------------------
    // 1. IDENTITY RESOLUTION (Always first)
    // --------------------------------------------------------
    let userId = "";
    let workspaceId = "";
    let role = "";

    // A. Standard Token
    const authHeader = request.headers.get("Authorization");
    const token = request.cookies.get("token")?.value || authHeader?.split(" ")[1];
    if (token) {
        const payload = await verifyToken(token);
        if (payload) {
            userId = payload.userId;
            workspaceId = payload.workspaceId;
            role = payload.role;
        }
    }

    // B. Partner Token
    if (!userId) {
        const partnerToken = request.cookies.get("partner_token")?.value;
        if (partnerToken) {
            const payload = await verifyToken(partnerToken);
            if (payload && payload.userId) {
                userId = payload.userId;
                workspaceId = "partner_root";
                role = "RESELLER";
            }
        }
    }

    // C. Admin Token
    if (!userId) {
        const adminToken = request.cookies.get("admin_token")?.value;
        if (adminToken) {
            const adminPayload = await verifyAdminToken(adminToken);
            if (adminPayload) {
                userId = adminPayload.id;
                workspaceId = "admin_root";
                role = "SUPER_ADMIN";
            }
        }
    }

    // --------------------------------------------------------
    // 2. GUEST-ONLY REDIRECTS 
    // --------------------------------------------------------
    const guestOnlyPaths = ["/login", "/register", "/reseller-register", "/super-admin/login", "/partner/login"];
    if (userId && guestOnlyPaths.includes(path)) {
        let dashboardPath = "/dashboard";
        if (role === "SUPER_ADMIN") dashboardPath = "/super-admin/dashboard";
        if (role === "RESELLER") dashboardPath = "/partner/dashboard";

        const protocol = request.headers.get("x-forwarded-proto") || "https";
        const baseHost = (process.env.NODE_ENV === "production" && host.includes("localhost")) ? "grafty.pro" : host;
        return NextResponse.redirect(new URL(`${protocol}://${baseHost}${dashboardPath}`));
    }

    // --------------------------------------------------------
    // 3. PATH-SPECIFIC GUARDS
    // --------------------------------------------------------

    // A. Super Admin Areas
    if (path.startsWith("/super-admin") || path.startsWith("/api/super-admin")) {
        // Essential bypasses
        if (path === "/super-admin/login" || path === "/api/super-admin/auth/login") {
            return NextResponse.next({ request: { headers: requestHeaders } });
        }

        if (role !== "SUPER_ADMIN") {
            if (path.startsWith("/api")) return NextResponse.json({ error: "Unauthorized Admin" }, { status: 401 });
            return NextResponse.redirect(new URL("/super-admin/login", request.url));
        }
    }

    const partnerPaths = ["/partner", "/api/reseller"];
    if (partnerPaths.some(p => path.startsWith(p))) {
        const isAuthRoute = [
            "/partner/login",
            "/api/reseller/auth/login",
            "/api/reseller/auth/register",
            "/api/reseller/auth/verify-otp",
            "/api/reseller/auth/resend-otp",
            "/partner/forgot-password",
            "/api/reseller/auth/forgot-password"
        ].includes(path);
        if (isAuthRoute) return NextResponse.next({ request: { headers: requestHeaders } });

        if (role !== "RESELLER") {
            if (path.startsWith("/api")) return NextResponse.json({ error: "Unauthorized Partner" }, { status: 401 });
            return NextResponse.redirect(new URL("/partner/login", request.url));
        }

        // --- PARTNER SUB-ROLE PROTECTION ---
        const partnerToken = request.cookies.get("partner_token")?.value;
        const payload = partnerToken ? await verifyToken(partnerToken) : null;
        const pRole = payload?.partnerRole || "AFFILIATE";
        requestHeaders.set("x-partner-role", pRole);

        if (pRole === "AFFILIATE") {
            const platformOnlyPaths = ["/partner/settings", "/partner/vendors", "/partner/subscriptions", "/partner/domain", "/partner/email"];
            if (platformOnlyPaths.some(p => path.startsWith(p))) {
                console.warn(`[Security] Affiliate Partner (ID: ${userId}) attempted to access Platform module: ${path}`);
                return NextResponse.redirect(new URL("/partner/dashboard?error=access_denied", request.url));
            }
        }

        requestHeaders.set("x-reseller-id", userId);
    }

    // C. Public/Bypass Paths
    const isPublicPath =
        path.startsWith("/api/auth") ||
        path.startsWith("/_next") ||
        path.startsWith("/landing") ||
        path.startsWith("/docs") ||
        path === "/" ||
        path === "/login" ||
        path === "/register" ||
        path === "/reseller" ||
        path === "/white-label" ||
        path === "/solutions" ||
        path === "/academy" ||
        path === "/pricing" ||
        path === "/terms" ||
        path === "/terms-and-conditions" ||
        path === "/privacy" ||
        path === "/privacy-policy" ||
        path === "/reseller-register" ||
        path === "/affiliate-partner" ||
        path === "/platform-partner" ||
        path === "/super-admin/login" ||
        path.startsWith("/api/super-admin/auth") ||
        path.startsWith("/api/webhooks") ||
        path.startsWith("/api/diagnostic") || // Allow diagnostic tool
        path.startsWith("/api/debug-catalog") || // TEMP debug — remove after use
        path.startsWith("/api/reset-admin") || // Temporary reset path
        path.startsWith("/api/ping") || // Allow connectivity test
        path.startsWith("/api/education/forms/submit") ||
        path.startsWith("/api/qa") ||
        path.startsWith("/api/crm/webhook") ||
        path.startsWith("/api/branding") ||
        path.startsWith("/api/billing/plans") ||
        path.startsWith("/api/config/public") ||
        path.startsWith("/uploads") ||
        path.includes("favicon") ||
        path.endsWith(".png") ||
        path.endsWith(".svg") ||
        path.endsWith(".jpg") ||
        path.endsWith(".jpeg") ||
        path.endsWith(".webp");

    if (isPublicPath) {
        logRequest(request, "ALLOWED (Public)");
        return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // --------------------------------------------------------
    // 4. FINAL PROTECTION & HEADER INJECTION
    // --------------------------------------------------------
    const isApiRoute = path.startsWith("/api");
    const isFeedbackRoute = path === "/api/feedback";

    if (userId) {
        requestHeaders.set("x-user-id", userId);
        requestHeaders.set("x-workspace-id", workspaceId);
        requestHeaders.set("x-user-role", role);
        return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // Unauthenticated protection
    if (isApiRoute) {
        if (isFeedbackRoute && request.method === 'GET') return NextResponse.next({ request: { headers: requestHeaders } });
        return NextResponse.json({ error: "Unauthorized Access" }, { status: 401 });
    }

    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const baseHost = (process.env.NODE_ENV === "production" && host.includes("localhost")) ? "grafty.pro" : host;
    return NextResponse.redirect(new URL(`${protocol}://${baseHost}/login`));
}

export const config = {
    matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|uploads|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)).*)"],
};
