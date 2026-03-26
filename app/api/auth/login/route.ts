
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { AuthSecurityService } from "../../../../lib/security/auth-utils";
import { RateLimiter } from "../../../../lib/security/rate-limit";
import { signToken } from "../../../../lib/auth";
import { signAdminToken } from "../../../../lib/admin-auth";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;
        const ip = request.headers.get("x-forwarded-for") || "unknown";

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        // 1. Rate Check
        const isLimited = await RateLimiter.isRestricted(`login:${ip}`, 5, 60); // 5 attempts per minute
        if (isLimited) {
            return NextResponse.json({ error: "Too many login attempts. Please try again later." }, { status: 429 });
        }

        const normalizedEmail = AuthSecurityService.normalizeEmail(email);
        console.log(`[AUTH_DEBUG] Login attempt for: ${email} -> Normalized: ${normalizedEmail}`);

        // 2. Find User
        const user = await prisma.user.findFirst({
            where: { email: normalizedEmail },
            include: {
                workspace: {
                    select: {
                        id: true,
                        reseller_id: true
                    }
                }
            }
        });

        if (!user) {
            console.warn(`[AUTH_FAILURE] Email not found: ${normalizedEmail}`);
            await RateLimiter.isRestricted(`login:${ip}`, 5, 60); 
            return NextResponse.json({ error: "Email address not found" }, { status: 401 });
        }

        // 2.5 Security: Tenant Isolation Check
        const host = request.headers.get("x-request-host") || request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
        const systemDomain = (process.env.NEXT_PUBLIC_APP_URL || "grafty.pro").replace(/https?:\/\//, "");
        
        // Resolve if we are on a partner domain
        const { BrandingService } = require("../../../../lib/branding/service");
        const partner = await BrandingService.getBrandingByDomain(host);

        if (partner) {
            // We are on a white-labeled domain
            if (user.workspace?.reseller_id !== partner.reseller_id) {
                console.warn(`[AUTH_ISOLATION] User ${user.email} attempted to login on partner domain ${host} but belongs to reseller ${user.workspace?.reseller_id}`);
                return NextResponse.json({ 
                    error: `This account is not associated with ${partner.brand_name}. Please login at the correct portal.` 
                }, { status: 403 });
            }
        } else if (!host.includes("localhost") && !host.includes(systemDomain)) {
            // Possible unrecognized domain or main domain check
            // For now, if it's not the main domain and not a registered partner, we might want to block or allow
        }

        // 3. Verify Password
        if (!user.password_hash || user.password_hash === "GOOGLE_OAUTH_NO_PASSWORD") {
            return NextResponse.json({ error: "This account uses Google login. Please click 'Continue with Google'." }, { status: 400 });
        }

        const isValid = await AuthSecurityService.comparePassword(password, user.password_hash || "");

        if (!isValid) {
            console.warn(`[AUTH_FAILURE] Wrong password for: ${normalizedEmail}`);
            // Log failure
            await AuthSecurityService.logEvent({
                userId: user.id || undefined,
                email: normalizedEmail,
                action: "LOGIN_FAILURE",
                status: "FAILURE",
                ipAddress: ip,
                userAgent: request.headers.get("user-agent") || undefined
            });
            return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
        }

        // 4. Check Verification
        if (!user.email_verified) {
            return NextResponse.json({
                error: "Email not verified. Please check your inbox.",
                code: "EMAIL_NOT_VERIFIED"
            }, { status: 403 });
        }

        // 5. Create Session
        const token = await signToken({
            userId: user.id,
            workspaceId: user.workspace_id || "",
            role: user.role
        });

        // Detect protocol via reverse proxy header (NGINX/Caddy sets x-forwarded-proto)
        const forwardedProto = request.headers.get("x-forwarded-proto");
        const isHttps = forwardedProto === "https" || request.url.startsWith("https://");

        // 6. Set Cookie & Return
        const response = NextResponse.json({ success: true, redirect: "/dashboard" });

        // CRITICAL: sameSite "none" requires secure=true or browsers reject the cookie silently.
        // Use "lax" always — it works on both HTTP (VPS direct) and HTTPS (via NGINX/Caddy).
        const cookieConfig: any = {
            httpOnly: true,
            secure: isHttps,
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7 // 7 days
        };

        response.cookies.set("token", token, cookieConfig);

        // SPECIAL DEMO OVERRIDE: Grant Super Admin and Partner access to demo@grafty.com
        if (normalizedEmail === "demo@grafty.com") {
            // Set Admin Token
            const adminToken = await signAdminToken({
                id: user.id,
                email: user.email,
                role: "SUPER_ADMIN"
            });
            response.cookies.set("admin_token", adminToken, cookieConfig);

            // Set Partner Token (Using the same regular signToken but for the partner_token cookie name)
            const partnerToken = await signToken({
                userId: user.id,
                workspaceId: user.workspace_id || "",
                role: "RESELLER",
                impersonation: true
            });
            response.cookies.set("partner_token", partnerToken, cookieConfig);
        }

        // Log Success
        await AuthSecurityService.logEvent({
            userId: user.id,
            email: normalizedEmail,
            action: "LOGIN_SUCCESS",
            status: "SUCCESS",
            ipAddress: ip,
            userAgent: request.headers.get("user-agent") || undefined
        });

        return response;

    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
