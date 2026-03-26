import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";
import { verifyAdminToken } from "./lib/admin-auth-core";

// ────────────────────────────────────────────────────────────────────────────────
// ⚠️  DO NOT import Prisma, BrandingService, or resolveTenantFromHost here.
//     Middleware MUST stay edge-compatible. Only use jose (JWT) + fetch + cookies.
//     Importing Prisma/Node libs causes silent middleware crashes → auth loop.
// ────────────────────────────────────────────────────────────────────────────────

// CRITICAL: Must be 'edge' for cookie-setting to work in Next.js 14+
// Do NOT set to 'nodejs' — that enables Prisma imports that crash middleware silently
export const runtime = 'experimental-edge';

// ────────────────────────────────────────────────────────────────────────────────
// COOKIE HELPER: Bulletproof cookie options for production HTTPS + HTTP
// ────────────────────────────────────────────────────────────────────────────────
function getCookieOptions(isHttps: boolean) {
    if (isHttps) {
        return { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 7 };
    }
    // HTTP (dev/VPS direct) — sameSite MUST be 'lax', never 'none' without secure
    return { httpOnly: true, secure: false, sameSite: "lax" as const, path: "/", maxAge: 60 * 60 * 24 * 7 };
}

// ────────────────────────────────────────────────────────────────────────────────
// PROTOCOL DETECTION: Trust X-Forwarded-Proto from NGINX/Caddy reverse proxy
// ────────────────────────────────────────────────────────────────────────────────
function detectProtocol(request: NextRequest): "https" | "http" {
    const forwarded = request.headers.get("x-forwarded-proto");
    if (forwarded === "https") return "https";
    if (forwarded === "http") return "http";
    const host = request.headers.get("host") || "";
    // If hostname is a raw IP or localhost → HTTP, otherwise assume HTTPS
    if (host.includes("localhost") || /^\d+\.\d+\.\d+\.\d+/.test(host)) return "http";
    return "https";
}

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    const protocol = detectProtocol(request);
    const isHttps = protocol === "https";
    const requestHeaders = new Headers(request.headers);

    // Always inject the resolved host so downstream API routes can trust it
    requestHeaders.set("x-request-host", host);

    // ────────────────────────────────────────────────────────────────────────────
    // 1. IDENTITY RESOLUTION
    //    Resolve user from cookies - edge-compatible only (no Prisma)
    // ────────────────────────────────────────────────────────────────────────────
    let userId = "";
    let workspaceId = "";
    let role = "";

    const isAdminRoute = path.startsWith("/super-admin") || path.startsWith("/api/super-admin");
    const isPartnerRoute = path.startsWith("/partner") || path.startsWith("/api/reseller");

    // A. Admin token check (only for admin routes + shared routes)
    if (isAdminRoute || path.startsWith("/api/media") || path.startsWith("/api/branding")) {
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

    // B. Partner token check
    if (!userId && (isPartnerRoute || path.startsWith("/api/media") || path.startsWith("/api/branding"))) {
        const partnerToken = request.cookies.get("partner_token")?.value;
        if (partnerToken) {
            const payload = await verifyToken(partnerToken);
            if (payload?.userId) {
                userId = payload.userId;
                workspaceId = "partner_root";
                role = "RESELLER";
            }
        }
    }

    // C. Standard user token (most common path)
    if (!userId && !isAdminRoute && !isPartnerRoute) {
        const authHeader = request.headers.get("Authorization");
        const tokenValue = request.cookies.get("token")?.value || authHeader?.split(" ")[1];
        if (tokenValue) {
            const payload = await verifyToken(tokenValue);
            if (payload?.userId) {
                userId = payload.userId;
                workspaceId = payload.workspaceId || "";
                role = payload.role || "OWNER";
            }
        }
    }

    // ────────────────────────────────────────────────────────────────────────────
    // 2. STATIC BRANDING INJECTION (edge-safe: no Prisma)
    //    Full tenant resolution happens in API routes, not middleware.
    //    Inject a lightweight static branding header so the UI has SOMETHING.
    // ────────────────────────────────────────────────────────────────────────────
    const mainDomainStr = (process.env.NEXT_PUBLIC_APP_URL || "https://grafty.pro").replace(/https?:\/\//, "");
    const isMainDomain =
        host.includes(mainDomainStr) ||
        host.includes("localhost") ||
        /^\d+\.\d+\.\d+\.\d+/.test(host);

    if (!requestHeaders.get("x-tenant-branding")) {
        // For custom domains, signal to the app that it should look up branding
        if (!isMainDomain) {
            requestHeaders.set("x-custom-domain", host);
        }
        // Always inject a safe default so the header is never missing
        const systemBranding = JSON.stringify({
            name: "Grafty",
            brand_name: "Grafty",
            logo_url: "/grafty.svg",
            favicon_url: "/grafty_fav.svg",
            primary_color: "#27954D",
            secondary_color: "#042F94",
            is_white_labeled: false,
            support: { email: "support@grafty.pro", whatsapp: "" }
        });
        requestHeaders.set("x-tenant-branding", systemBranding);
    }

    // ────────────────────────────────────────────────────────────────────────────
    // 3. BILLING BYPASS — authenticated users ALWAYS reach billing regardless
    // ────────────────────────────────────────────────────────────────────────────
    if (userId && (path.startsWith("/dashboard/settings/billing") || path.startsWith("/api/billing"))) {
        requestHeaders.set("x-user-id", userId);
        requestHeaders.set("x-workspace-id", workspaceId);
        requestHeaders.set("x-user-role", role);
        return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // ────────────────────────────────────────────────────────────────────────────
    // 4. GUEST-ONLY GUARD — redirect logged-in users away from auth pages
    //    Use startsWith checks, NOT exact .includes(), to handle query strings
    // ────────────────────────────────────────────────────────────────────────────
    const guestOnlyPaths = [
        "/login",
        "/register",
        "/reseller-register",
        "/super-admin/login",
        "/partner/login",
    ];
    const isGuestOnlyPath = guestOnlyPaths.some(p => path === p || path.startsWith(p + "?") || path.startsWith(p + "/"));

    if (userId && isGuestOnlyPath) {
        let dashboardPath = "/dashboard";
        if (role === "SUPER_ADMIN") dashboardPath = "/super-admin/dashboard";
        if (role === "RESELLER") dashboardPath = "/partner/dashboard";
        return NextResponse.redirect(new URL(`${protocol}://${host}${dashboardPath}`));
    }

    // ────────────────────────────────────────────────────────────────────────────
    // 5. PUBLIC & STATIC PATHS — always allow, no auth needed
    // ────────────────────────────────────────────────────────────────────────────
    const publicAuthRoutes = [
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/otp",
        "/api/auth/verify",
        "/api/auth/password",
        "/api/auth/remember",
        "/api/auth/unified",
        "/api/auth/google",        // Google OAuth initiation
        "/api/auth/facebook",
        "/api/auth/logout",
        "/api/auth/claim-offer",
        "/api/auth/complete-profile",
        "/api/auth/profile-update",
        "/api/auth/debug-login",
        "/api/auth/clear-rate-limit",
        "/api/auth/sso-complete",  // SSO handoff MUST be public
    ];
    const isPublicAuthRoute = publicAuthRoutes.some(p => path.startsWith(p));

    const isPublicPath =
        isPublicAuthRoute ||
        path.startsWith("/_next") ||
        path.startsWith("/landing") ||
        path.startsWith("/docs") ||
        path === "/" ||
        path === "/login" ||
        path === "/register" ||
        path === "/reseller" ||
        path === "/white-label" ||
        path.startsWith("/solutions") ||
        path.startsWith("/academy") ||
        path.startsWith("/compare") ||
        path === "/pricing" ||
        path === "/terms" ||
        path === "/terms-and-conditions" ||
        path === "/privacy" ||
        path === "/privacy-policy" ||
        path === "/reseller-register" ||
        path === "/affiliate-partner" ||
        path === "/platform-partner" ||
        path.startsWith("/whatsapp-link-generator") ||
        path.startsWith("/whatsapp-cost-calculator") ||
        path.startsWith("/whatsapp-green-tick-checker") ||
        path === "/super-admin/login" ||
        path.startsWith("/api/super-admin/auth") ||
        path.startsWith("/api/webhooks") ||
        path.startsWith("/api/whatsapp/webhook") ||
        path.startsWith("/api/diagnostic") ||
        path.startsWith("/api/debug-catalog") ||
        path.startsWith("/api/reset-admin") ||
        path.startsWith("/api/ping") ||
        path.startsWith("/api/education/forms/submit") ||
        path.startsWith("/api/tools/lead-capture") ||
        path.startsWith("/api/qa") ||
        path.startsWith("/api/crm/webhook") ||
        path.startsWith("/api/branding") ||
        path.startsWith("/api/billing/plans") ||
        path.startsWith("/api/public/config") ||
        path.startsWith("/api/media/local") ||
        path.startsWith("/uploads") ||
        path.includes("favicon") ||
        path.endsWith(".png") ||
        path.endsWith(".svg") ||
        path.endsWith(".jpg") ||
        path.endsWith(".jpeg") ||
        path.endsWith(".pdf") ||
        path.endsWith(".webp");

    if (isPublicPath) {
        return NextResponse.next({ request: { headers: requestHeaders } });
    }

    // ────────────────────────────────────────────────────────────────────────────
    // 6. SUPER ADMIN PROTECTION
    // ────────────────────────────────────────────────────────────────────────────
    if (isAdminRoute) {
        if (
            path === "/super-admin/login" ||
            path === "/api/super-admin/auth/login" ||
            path.startsWith("/api/super-admin/media/")
        ) {
            return NextResponse.next({ request: { headers: requestHeaders } });
        }
        if (role !== "SUPER_ADMIN") {
            if (path.startsWith("/api")) return NextResponse.json({ error: "Unauthorized Admin" }, { status: 401 });
            return NextResponse.redirect(new URL(`${protocol}://${host}/super-admin/login`));
        }
    }

    // ────────────────────────────────────────────────────────────────────────────
    // 7. PARTNER / RESELLER PROTECTION
    // ────────────────────────────────────────────────────────────────────────────
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
            return NextResponse.redirect(new URL(`${protocol}://${host}/partner/login`));
        }

        // Sub-role check
        const partnerToken = request.cookies.get("partner_token")?.value;
        const pPayload = partnerToken ? await verifyToken(partnerToken) : null;
        const pRole = pPayload?.partnerRole || "AFFILIATE";
        requestHeaders.set("x-partner-role", pRole);

        if (pRole === "AFFILIATE") {
            const platformOnlyPaths = ["/partner/settings", "/partner/vendors", "/partner/subscriptions", "/partner/domain", "/partner/email"];
            if (platformOnlyPaths.some(p => path.startsWith(p))) {
                return NextResponse.redirect(new URL(`${protocol}://${host}/partner/dashboard?error=access_denied`));
            }
        }
        requestHeaders.set("x-reseller-id", userId);
    }

    // ────────────────────────────────────────────────────────────────────────────
    // 8. FINAL AUTH GATE — protect all remaining routes
    // ────────────────────────────────────────────────────────────────────────────
    const isApiRoute = path.startsWith("/api");

    if (userId) {
        requestHeaders.set("x-user-id", userId);
        requestHeaders.set("x-workspace-id", workspaceId);
        requestHeaders.set("x-user-role", role);

        const response = NextResponse.next({ request: { headers: requestHeaders } });
        // Security hardening headers
        response.headers.set("X-Content-Type-Options", "nosniff");
        response.headers.set("X-Frame-Options", "DENY");
        response.headers.set("X-XSS-Protection", "1; mode=block");
        response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
        return response;
    } else if (isApiRoute) {
        // Special case: GET /api/feedback is public
        if (path === "/api/feedback" && request.method === "GET") {
            return NextResponse.next({ request: { headers: requestHeaders } });
        }
        return NextResponse.json({ error: "Unauthorized Access" }, { status: 401 });
    } else {
        // No token found, not a public path → redirect to login
        return NextResponse.redirect(new URL(`${protocol}://${host}/login`));
    }
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads|.*\\.(?:png|jpg|jpeg|svg|gif|webp|pdf|ico)).*)" ],
};
