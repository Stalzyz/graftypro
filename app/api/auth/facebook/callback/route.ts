import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { signToken } from "../../../../../lib/auth";
import { SystemConfigService } from "../../../../../lib/services/system-config-service";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const oauthError = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    const PUBLIC_URL = process.env.NEXT_PUBLIC_APP_URL || "https://grafty.pro";

    if (oauthError) {
        console.error("[Facebook OAuth] Error from Facebook:", oauthError, errorDescription);
        return NextResponse.redirect(new URL("/login?error=" + encodeURIComponent(errorDescription || oauthError), PUBLIC_URL));
    }

    if (!code) {
        return NextResponse.redirect(new URL("/login?error=missing_code", PUBLIC_URL));
    }

    const REDIRECT_URI =
        process.env.NODE_ENV === "development"
            ? "http://localhost:3000/api/auth/facebook/callback"
            : process.env.FACEBOOK_REDIRECT_URI || "https://grafty.pro/api/auth/facebook/callback";

    try {
        // Get app secrets from DB or ENV
        const secrets = await SystemConfigService.getDecryptedSecrets();
        const config = await SystemConfigService.getPublicConfig();

        const FB_CLIENT_ID = config.facebook_client_id || process.env.FACEBOOK_CLIENT_ID;
        const FB_CLIENT_SECRET = secrets.facebook_client_secret || process.env.FACEBOOK_CLIENT_SECRET;

        if (!FB_CLIENT_ID || !FB_CLIENT_SECRET) {
            throw new Error("Facebook App ID or Secret is not configured.");
        }

        // ── 1. Exchange code for access token ────────────────────────────
        console.log("[Facebook OAuth] Exchanging code...");
        const tokenUrl = `https://graph.facebook.com/v18.0/oauth/access_token?client_id=${FB_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&client_secret=${FB_CLIENT_SECRET}&code=${code}`;

        const tokenRes = await fetch(tokenUrl);
        const tokens = await tokenRes.json();

        if (tokens.error) {
            console.error("[Facebook OAuth] Token error:", tokens.error);
            return NextResponse.redirect(
                new URL("/login?error=" + encodeURIComponent("Facebook login failed: " + tokens.error.message), PUBLIC_URL)
            );
        }

        // ── 2. Fetch Facebook user profile ───────────────────────────────
        const userUrl = `https://graph.facebook.com/me?fields=id,name,email,picture.type(large)&access_token=${tokens.access_token}`;
        const userRes = await fetch(userUrl);
        const fbUser = await userRes.json();

        if (fbUser.error) {
            throw new Error(fbUser.error.message);
        }

        const email: string = fbUser.email;
        const fullName: string = fbUser.name || "";
        const [firstName, ...rest] = fullName.split(" ");
        const lastName = rest.join(" ");

        if (!email) {
            // Facebook might not provide an email if the user registered with a phone number 
            // or explicitly denied the email permission.
            throw new Error("Facebook did not return an email address. Please make sure email sharing is allowed.");
        }

        console.log("[Facebook OAuth] Got profile for:", email);

        const normalizedEmail = email.trim().toLowerCase();

        // ── 3. Find or create user using raw SQL (matching Google implementation) ──
        const existingRows: any[] = await prisma.$queryRaw`
            SELECT id, workspace_id, role, email FROM users WHERE email = ${normalizedEmail} LIMIT 1
        `;

        let userId: string;
        let workspaceId: string;
        let userRole: string;

        if (existingRows.length > 0) {
            userId = existingRows[0].id;
            workspaceId = existingRows[0].workspace_id;
            userRole = existingRows[0].role;
            console.log("[Facebook OAuth] Existing user:", userId);

            try {
                await prisma.$executeRaw`
                    UPDATE users SET
                        updated_at = NOW()
                    WHERE id = ${userId}
                `;
            } catch (updateErr) {
                // Non-fatal
            }
        } else {
            console.log("[Facebook OAuth] Creating new user for:", normalizedEmail);

            const wsId = crypto.randomUUID();
            const usrId = crypto.randomUUID();
            const now = new Date();

            // Create workspace
            await prisma.$executeRaw`
                INSERT INTO workspaces (id, name, business_name, status, timezone, created_at, updated_at)
                VALUES (
                    ${wsId},
                    ${firstName ? `${firstName}'s Workspace` : "My Workspace"},
                    ${firstName ? `${firstName}'s Business` : "My Business"},
                    'ACTIVE',
                    'Asia/Kolkata',
                    ${now},
                    ${now}
                )
            `;

            // Create user
            try {
                await prisma.$executeRaw`
                    INSERT INTO users (id, workspace_id, email, password_hash, role, first_name, last_name, email_verified, created_at, updated_at)
                    VALUES (
                        ${usrId},
                        ${wsId},
                        ${normalizedEmail},
                        'FACEBOOK_OAUTH_NO_PASSWORD',
                        'OWNER',
                        ${firstName || null},
                        ${lastName || null},
                        ${now},
                        ${now},
                        ${now}
                    )
                `;
            } catch (insertErr: any) {
                console.error("[Facebook OAuth] User insert error:", insertErr.message);
                throw insertErr;
            }

            userId = usrId;
            workspaceId = wsId;
            userRole = "OWNER";

            console.log("[Facebook OAuth] Created user:", userId, "workspace:", workspaceId);
        }

        // ── 4. Sign session token ─────────────────────────────────────────
        const sessionToken = await signToken({
            userId,
            workspaceId,
            role: userRole
        });

        // ── 5. Redirect to dashboard ──────────────────────────────────────
        const redirectTarget = new URL("/dashboard", PUBLIC_URL);
        console.log("[Facebook OAuth] ✅ Success — redirecting to:", redirectTarget.toString());

        const response = NextResponse.redirect(redirectTarget);
        response.cookies.set("token", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7
        });

        return response;

    } catch (err: any) {
        console.error("[Facebook OAuth] Fatal error:", err?.message);
        console.error("[Facebook OAuth] Stack:", err?.stack);
        return NextResponse.redirect(
            new URL("/login?error=" + encodeURIComponent(err?.message || "Authentication error"), PUBLIC_URL)
        );
    }
}
