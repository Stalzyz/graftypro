import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./lib/auth";
import { verifyAdminToken } from "./lib/admin-auth-core";
import { resolveTenantFromHost } from "./lib/tenant/resolver";

// FORCE NODEJS RUNTIME TO ALLOW PRISMA ACCESS IN MIDDLEWARE
export const runtime = 'nodejs';

// DEBUG LOGGING
function logRequest(req: NextRequest, status: string) {
    // console.log(`[Middleware] ${req.method} ${req.nextUrl.pathname} -> ${status}`);
}

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    const host = request.headers.get("host") || "";
    const requestHeaders = new Headers(request.headers);

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
    // 2. CUSTOM DOMAIN / TENANT RESOLUTION
    // --------------------------------------------------------
    let tenantId = "";
    let tenantBranding = null;

    // Detect if we are on a custom domain (not localhost and not the main domain)
    const mainDomains = ["grafty.pro", "app.grafty.pro", "localhost:3000", "localhost:3001"];
    const isCustomDomain = !mainDomains.some(d => host.includes(d));

    if (isCustomDomain) {
        const tenant = await resolveTenantFromHost(host);
        if (tenant) {
            tenantId = tenant.partnerId;
            tenantBranding = tenant.branding;
            
            // Inject Tenant Context
            requestHeaders.set("x-tenant-id", tenantId);
            requestHeaders.set("x-tenant-branding", JSON.stringify(tenantBranding));
            
            if (process.env.NODE_ENV !== 'production') {
                console.log(`[MW TENANT] 🏴‍☠️ White-Label Detected: ${host} -> Partner ${tenantId}`);
            }

            // CUSTOM HOME PAGE LOGIC (Tier 1-3)
            if (path === "/" || path === "/index") {
                const type = (tenantBranding as any)?.home_page_type || "DEFAULT";
                
                // Tier 2: External Redirect
                if (type === "EXTERNAL" && (tenantBranding as any)?.external_home_url) {
                    return NextResponse.redirect((tenantBranding as any).external_home_url);
                }

                // Tier 1 & 3: DEFAULT or CUSTOM
                // We let the request proceed to the root route (app/page.tsx), 
                // but ONLY if the user is NOT logged in. 
                // If logged in, we still might want to show the homepage OR go to dashboard.
                // Re-seller partners usually want root to be their landing page.
                if (userId && !request.nextUrl.searchParams.has("force_home")) {
                    const protocol = request.headers.get("x-forwarded-proto") || "https";
                    return NextResponse.redirect(new URL(`${protocol}://${host}/dashboard`));
                }
                
                // Allow proceed to app/page.tsx
                return NextResponse.next({
                    request: {
                        headers: requestHeaders,
                    },
                });
            }
        }
    }

    // Inject request host for internal use
    requestHeaders.set("x-request-host", host);

    // --------------------------------------------------------
    // 3. PRIORITY BYPASS & GUEST GUARDS
    // --------------------------------------------------------
    
    // NUCLEAR BYPASS: Always allow authenticated users to reach billing
    // This prevents any potential loop where a user is redirected away from the page they need to fix their subscription.
    if (userId && (path.startsWith("/dashboard/settings/billing") || path.startsWith("/api/billing"))) {
        requestHeaders.set("x-user-id", userId);
        requestHeaders.set("x-workspace-id", workspaceId);
        requestHeaders.set("x-user-role", role);
        return NextResponse.next({ request: { headers: requestHeaders } });
    }

    const guestOnlyPaths = ["/login", "/register", "/reseller-register", "/super-admin/login", "/partner/login"];
    if (userId && guestOnlyPaths.includes(path)) {
        let dashboardPath = "/dashboard";
        if (role === "SUPER_ADMIN") dashboardPath = "/super-admin/dashboard";
        if (role === "RESELLER") dashboardPath = "/partner/dashboard";

        const protocol = request.headers.get("x-forwarded-proto") || "https";
        // Trust the current host to maintain whitelabel integrity
        return NextResponse.redirect(new URL(`${protocol}://${host}${dashboardPath}`));
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
    // Note: Only specific, unauthenticated /api/auth routes are bypassed.
    // Auth-gated routes like /api/auth/trial-status must NOT be in this list.
    const publicAuthRoutes = [
        "/api/auth/login",
        "/api/auth/register",
        "/api/auth/otp",
        "/api/auth/verify",
        "/api/auth/password",
        "/api/auth/remember",
        "/api/auth/unified",
        "/api/auth/google",
        "/api/auth/facebook",
        "/api/auth/logout",
        "/api/auth/claim-offer",
        "/api/auth/complete-profile",
        "/api/auth/profile-update",
        "/api/auth/debug-login",       // Temporary: diagnosis endpoint
        "/api/auth/clear-rate-limit",  // Temporary: unblock rate-limited IPs
        "/api/whatsapp/manual-setup",  // NUCLEAR BYPASS
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
        path.startsWith("/api/diagnostic") || // Allow diagnostic tool
        path.startsWith("/api/debug-catalog") || // TEMP debug — remove after use
        path.startsWith("/api/reset-admin") || // Temporary reset path
        path.startsWith("/api/ping") || // Allow connectivity test
        path.startsWith("/api/education/forms/submit") ||
        path.startsWith("/api/tools/lead-capture") ||
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

    let response = NextResponse.next({ request: { headers: requestHeaders } });

    if (userId) {
        requestHeaders.set("x-user-id", userId);
        requestHeaders.set("x-workspace-id", workspaceId);
        requestHeaders.set("x-user-role", role);
        response = NextResponse.next({ request: { headers: requestHeaders } });
    } else if (isApiRoute) {
        if (isFeedbackRoute && request.method === 'GET') {
            response = NextResponse.next({ request: { headers: requestHeaders } });
        } else {
            console.log(`[MW TRACE] ⛔️ BLOCKED (401) - Request did not resolve to a user`);
            return NextResponse.json({ error: "Unauthorized Access" }, { status: 401 });
        }
    } else {
        const protocol = request.headers.get("x-forwarded-proto") || "https";
        // Never force a specific domain for login unless absolutely necessary
        return NextResponse.redirect(new URL(`${protocol}://${host}/login`));
    }

    // DEFENSIVE SECURITY: Inject standard hardening headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("X-XSS-Protection", "1; mode=block");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

    // Rate Limiting Placeholder (Upstash/Redis hook point)
    if (path.startsWith("/api/super-admin")) {
        // const { success } = await rateLimit.limit(userId || 'anonymous');
        // if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    return response;
}

export const config = {
    // Removed api/auth from the exclusion list — auth routes like trial-status need
    // the middleware to run so that x-user-id headers are properly injected.
    // Public vs. protected auth routes are distinguished inside the middleware.
    matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads|.*\\.(?:png|jpg|jpeg|svg|gif|webp|ico)).*)"],
};
