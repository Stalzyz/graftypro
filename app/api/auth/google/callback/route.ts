import { prisma } from "../../../../../lib/db";
import { signToken, getCurrentUser } from "../../../../../lib/auth";
import { NextResponse } from "next/server";
import crypto from "crypto";

// ─────────────────────────────────────────────────────────────────────────────
// Google OAuth Callback Handler
//
// KEY FIXES:
//  1. Cookie sameSite is ALWAYS "lax" — never "none" without secure=true.
//     "none" without secure is silently rejected by ALL browsers.
//  2. Protocol is detected from x-forwarded-proto (set by NGINX/Caddy).
//  3. If the proxy doesn't set x-forwarded-proto, we default to "https" on
//     named domains, "http" on raw IPs / localhost.
//  4. The token is placed in the redirect URL as a query param for the
//     sso-complete handoff — this avoids ALL cross-domain cookie issues.
// ─────────────────────────────────────────────────────────────────────────────

const MAIN_DOMAIN = process.env.NEXT_PUBLIC_APP_URL || "https://grafty.pro";

function detectProtocol(request: Request): "https" | "http" {
    const forwarded = request.headers.get("x-forwarded-proto");
    if (forwarded === "https") return "https";
    if (forwarded === "http") return "http";
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
    if (host.includes("localhost") || /^\d+\.\d+\.\d+\.\d+/.test(host.split(":")[0])) return "http";
    return "https";
}

function buildCookieOptions(isHttps: boolean) {
    // CRITICAL: never use sameSite=none unless secure=true — browsers drop it silently
    return {
        httpOnly: true,
        secure: isHttps,
        sameSite: "lax" as const, // "lax" works for both HTTP and HTTPS, no browser rejection
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
    };
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const oauthError = searchParams.get("error");
    const stateVal = searchParams.get("state");

    let PUBLIC_URL = MAIN_DOMAIN;
    console.log("[Google OAuth] Callback received. Params:", { 
        hasCode: !!code, 
        hasState: !!stateVal, 
        error: oauthError 
    });

    // Attempt to restore whitelabel host from OAuth state
        try {
            if (stateVal) {
                const decoded = JSON.parse(
                    Buffer.from(decodeURIComponent(stateVal), "base64").toString("utf8")
                );
                
                // Sanitize returnTo: must be a valid URL and preferably on a known domain
                if (decoded.returnTo && typeof decoded.returnTo === "string" && decoded.returnTo.startsWith("http")) {
                    PUBLIC_URL = decoded.returnTo;
                }
                
                // Check for integration flag
                if (decoded.isIntegration) {
                    (request as any).isIntegrationFlow = true;
                }
                console.log("[Google OAuth] Decoded state:", { PUBLIC_URL, isIntegration: (request as any).isIntegrationFlow });
            }
        } catch (e) {
            console.error("[Google OAuth] Failed to parse state parameter:", e);
        }

    if (oauthError) {
        console.error("[Google OAuth] Error from Google:", oauthError);
        return NextResponse.redirect(
            new URL("/login?error=" + encodeURIComponent(oauthError), PUBLIC_URL)
        );
    }

    if (!code) {
        console.error("[Google OAuth] No code in callback");
        return NextResponse.redirect(new URL("/login?error=missing_code", PUBLIC_URL));
    }

    // REDIRECT_URI must exactly match what is registered in Google Cloud Console
    const REDIRECT_URI =
        process.env.NODE_ENV === "development"
            ? "http://localhost:3000/api/auth/google/callback"
            : process.env.GOOGLE_REDIRECT_URI || `${MAIN_DOMAIN}/api/auth/google/callback`;

    try {
        // ── 1. Exchange auth code for tokens ────────────────────────────────
        console.log("[Google OAuth] Exchanging code for tokens...");
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: REDIRECT_URI,
                grant_type: "authorization_code",
            }),
        });

        const tokens = await tokenRes.json();

        if (tokens.error) {
            console.error("[Google OAuth] Token exchange error:", tokens.error, tokens.error_description);
            return NextResponse.redirect(
                new URL(
                    "/login?error=" + encodeURIComponent("Google auth failed: " + tokens.error),
                    PUBLIC_URL
                )
            );
        }

        console.log("[Google OAuth] Tokens received successfully. Scope:", tokens.scope);

        // ── 1.5 Handle Integration Handshake ────────────────────────────────
        if ((request as any).isIntegrationFlow) {
            console.log("[Google OAuth] Processing INTEGRATION flow...");
            const currentUser = await getCurrentUser(request);
            if (!currentUser) {
                console.error("[Google OAuth] Integration failed: No active session found");
                return NextResponse.redirect(new URL("/login?error=session_required_for_integration", PUBLIC_URL));
            }

            // Upsert integration record (raw SQL to bypass schema sync issues)
            const creds = JSON.stringify({
                access_token: tokens.access_token,
                refresh_token: tokens.refresh_token,
                expiry_date: Date.now() + (tokens.expires_in * 1000),
                token_type: tokens.token_type,
                scope: tokens.scope
            });

            await prisma.$executeRaw`
                INSERT INTO integrations (id, workspace_id, type, credentials, is_active, created_at, updated_at)
                VALUES (
                    ${crypto.randomUUID()}, 
                    ${currentUser.workspaceId}, 
                    'GOOGLE_CALENDAR', 
                    ${creds}::jsonb, 
                    true, 
                    NOW(), 
                    NOW()
                )
                ON CONFLICT (workspace_id, type) DO UPDATE SET 
                    credentials = ${creds}::jsonb,
                    is_active = true,
                    updated_at = NOW();
            `;

            console.log("[Google OAuth] ✅ Integration Linked for workspace:", currentUser.workspaceId);
            return NextResponse.redirect(new URL("/dashboard/settings/integrations?status=integration_success", PUBLIC_URL));
        }

        // ── 2. Fetch Google user profile ────────────────────────────────────
        const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const googleUser = await userRes.json();

        const email: string = googleUser.email;
        const googleId: string = googleUser.id;
        const fullName: string = googleUser.name || "";
        const picture: string = googleUser.picture || "";
        const [firstName, ...rest] = fullName.split(" ");
        const lastName = rest.join(" ");

        if (!email) {
            throw new Error("Google did not return an email address.");
        }

        console.log("[Google OAuth] Got profile for:", email);
        const normalizedEmail = email.trim().toLowerCase();

        // ── 3. Find or create user (raw SQL — bypasses Prisma schema drift) ─
        const existingRows: any[] = await prisma.$queryRaw`
            SELECT id, workspace_id, role FROM users WHERE email = ${normalizedEmail} LIMIT 1
        `;

        let userId: string;
        let workspaceId: string;
        let userRole: string;

        if (existingRows.length > 0) {
            userId = existingRows[0].id;
            workspaceId = existingRows[0].workspace_id;
            userRole = existingRows[0].role;
            console.log("[Google OAuth] Existing user:", userId);

            // Self-healing: attribute to reseller if on whitelabel domain and not yet attributed
            if (PUBLIC_URL && !PUBLIC_URL.includes("grafty.pro") && !PUBLIC_URL.includes("localhost")) {
                try {
                    const domain = new URL(PUBLIC_URL).hostname;
                    const { BrandingService } = await import("../../../../../lib/branding/service");
                    const partner = await BrandingService.getBrandingByDomain(domain);
                    if (partner?.reseller_id) {
                        const wsRows: any[] = await prisma.$queryRaw`
                            SELECT reseller_id FROM workspaces WHERE id = ${workspaceId} LIMIT 1
                        `;
                        if (wsRows.length > 0 && !wsRows[0].reseller_id) {
                            console.log("[Google OAuth] Self-healing: attributing workspace to reseller");
                            await prisma.$executeRaw`
                                UPDATE workspaces SET reseller_id = ${partner.reseller_id} WHERE id = ${workspaceId}
                            `;
                        }
                    }
                } catch (attrErr) {
                    // Non-fatal — don't fail the login for attribution issues
                    console.warn("[Google OAuth] Reseller attribution skipped:", attrErr);
                }
            }
        } else {
            // ── New user: create workspace + wallet + user ──────────────────
            console.log("[Google OAuth] Creating new user:", normalizedEmail);

            let resellerId: string | null = null;
            if (PUBLIC_URL && !PUBLIC_URL.includes("grafty.pro") && !PUBLIC_URL.includes("localhost")) {
                try {
                    const domain = new URL(PUBLIC_URL).hostname;
                    const { BrandingService } = await import("../../../../../lib/branding/service");
                    const partner = await BrandingService.getBrandingByDomain(domain);
                    if (partner) resellerId = partner.reseller_id;
                } catch (e) {
                    console.error("[Google OAuth] Failed to resolve reseller for new user attribution");
                }
            }

            const wsId = crypto.randomUUID();
            const usrId = crypto.randomUUID();
            const walletId = crypto.randomUUID();
            const now = new Date();

            // TrialLock: one trial per email address
            const lockRows: any[] = await prisma.$queryRaw`
                SELECT trial_ends_at FROM trial_locks WHERE email = ${normalizedEmail} LIMIT 1
            `;
            let finalTrialEnd: Date;
            if (lockRows.length > 0) {
                finalTrialEnd = new Date(lockRows[0].trial_ends_at);
            } else {
                finalTrialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
                await prisma.$executeRaw`
                    INSERT INTO trial_locks (id, email, first_used_at, trial_ends_at)
                    VALUES (${crypto.randomUUID()}, ${normalizedEmail}, ${now}, ${finalTrialEnd})
                `;
            }

            // Bug #7 Fix: Look up the default plan and link it, exactly as the email
            // register route does. Without this, Google OAuth users have current_plan_id=null
            // and always hit the 100-credit trial cap.
            const defaultPlanRow: any[] = await prisma.$queryRaw`
                SELECT id FROM subscription_plans WHERE is_active = true ORDER BY sort_order ASC LIMIT 1
            `;
            const defaultPlanId: string | null = defaultPlanRow.length > 0 ? defaultPlanRow[0].id : null;

            // Create workspace
            await prisma.$executeRaw`
                INSERT INTO workspaces (id, name, business_name, status, timezone, trial_ends_at, reseller_id, current_plan_id, created_at, updated_at)
                VALUES (
                    ${wsId},
                    ${firstName ? `${firstName}'s Workspace` : "My Workspace"},
                    ${firstName ? `${firstName}'s Business` : "My Business"},
                    'ACTIVE',
                    'Asia/Kolkata',
                    ${finalTrialEnd},
                    ${resellerId},
                    ${defaultPlanId},
                    ${now},
                    ${now}
                )
            `;

            // Create credit wallet
            await prisma.$executeRaw`
                INSERT INTO vendor_wallets (id, workspace_id, current_balance, total_purchased, total_used, created_at, updated_at)
                VALUES (${walletId}, ${wsId}, 500.00, 0.00, 0.00, ${now}, ${now})
            `;

            // Create user
            await prisma.$executeRaw`
                INSERT INTO users (id, workspace_id, email, password_hash, role, first_name, last_name, email_verified, created_at, updated_at)
                VALUES (
                    ${usrId},
                    ${wsId},
                    ${normalizedEmail},
                    'GOOGLE_OAUTH_NO_PASSWORD',
                    'OWNER',
                    ${firstName || null},
                    ${lastName || null},
                    ${now},
                    ${now},
                    ${now}
                )
            `;

            userId = usrId;
            workspaceId = wsId;
            userRole = "OWNER";
            console.log("[Google OAuth] Created user:", userId, "workspace:", workspaceId);
        }

        // ── 4. Sign session JWT ─────────────────────────────────────────────
        const sessionToken = await signToken({ userId, workspaceId, role: userRole });

        // ── 5. Detect protocol and set cookie ──────────────────────────────
        const reqProtocol = detectProtocol(request);
        const isHttps = reqProtocol === "https";
        const cookieOptions = buildCookieOptions(isHttps);

        // ── 6. Determine redirect destination ──────────────────────────────
        const mainDomainClean = MAIN_DOMAIN.replace(/https?:\/\//, "");
        const isPartnerDomain =
            PUBLIC_URL &&
            !PUBLIC_URL.includes(mainDomainClean) &&
            !PUBLIC_URL.includes("localhost") &&
            !PUBLIC_URL.includes("127.0.0.1");

        if (isPartnerDomain) {
            // Cross-domain: send token to partner's sso-complete endpoint
            // The partner domain will set the cookie on its own domain
            const ssoHandoffUrl = new URL("/api/auth/sso-complete", PUBLIC_URL);
            ssoHandoffUrl.searchParams.set("token", sessionToken);
            ssoHandoffUrl.searchParams.set("type", "token");
            console.log("[Google OAuth] ✅ Partner SSO handoff →", ssoHandoffUrl.toString());
            return NextResponse.redirect(ssoHandoffUrl);
        }

        // Same-domain (main platform): set cookie directly and go to dashboard
        // CRITICAL FIX: Ensure the redirect target is absolute and uses the correct domain
        const redirectTarget = new URL("/dashboard", PUBLIC_URL);
        console.log("[Google OAuth] ✅ Success! Redirecting to dashboard:", redirectTarget.toString());

        const response = NextResponse.redirect(redirectTarget);
        response.cookies.set("token", sessionToken, cookieOptions);

        return response;

    } catch (err: any) {
        console.error("[Google OAuth] Fatal error:", err?.message);
        console.error("[Google OAuth] Stack:", err?.stack);
        return NextResponse.redirect(
            new URL(
                "/login?error=" + encodeURIComponent(err?.message || "Authentication error"),
                PUBLIC_URL
            )
        );
    }
}
