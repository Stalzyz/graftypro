
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { signToken } from "../../../../../lib/auth";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get("code");
    const oauthError = searchParams.get("error");

    const PUBLIC_URL = process.env.NEXT_PUBLIC_APP_URL || "https://grafty.pro";

    if (oauthError) {
        console.error("[Google OAuth] Error from Google:", oauthError);
        return NextResponse.redirect(new URL("/login?error=" + encodeURIComponent(oauthError), PUBLIC_URL));
    }

    if (!code) {
        return NextResponse.redirect(new URL("/login?error=missing_code", PUBLIC_URL));
    }

    const REDIRECT_URI =
        process.env.NODE_ENV === "development"
            ? "http://localhost:3000/api/auth/google/callback"
            : process.env.GOOGLE_REDIRECT_URI || "https://grafty.pro/api/auth/google/callback";

    try {
        // ── 1. Exchange code for tokens ──────────────────────────────────
        console.log("[Google OAuth] Exchanging code...");
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID!,
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: REDIRECT_URI,
                grant_type: "authorization_code"
            })
        });

        const tokens = await tokenRes.json();

        if (tokens.error) {
            console.error("[Google OAuth] Token error:", tokens.error, tokens.error_description);
            return NextResponse.redirect(
                new URL("/login?error=" + encodeURIComponent("Google token error: " + tokens.error), PUBLIC_URL)
            );
        }

        // ── 2. Fetch Google user profile ─────────────────────────────────
        const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
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

        // ── 3. Find or create user using raw SQL (bypasses Prisma client column mismatch) ──
        // Check existing user
        const existingRows: any[] = await prisma.$queryRaw`
            SELECT id, workspace_id, role, email FROM users WHERE email = ${normalizedEmail} LIMIT 1
        `;

        let userId: string;
        let workspaceId: string;
        let userRole: string;

        if (existingRows.length > 0) {
            // Existing user — just update google_id if column exists (ignore errors)
            userId = existingRows[0].id;
            workspaceId = existingRows[0].workspace_id;
            userRole = existingRows[0].role;
            console.log("[Google OAuth] Existing user:", userId);

            // Try to update google_id — if column doesn't exist, silently ignore
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
            // New user — create workspace first, then user, all raw SQL
            console.log("[Google OAuth] Creating new user for:", normalizedEmail);

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

            // Create user with only the guaranteed columns (no google_id etc. that may not exist yet)
            // Try with extended columns first, fall back to minimal insert
            try {
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
            } catch (insertErr: any) {
                console.error("[Google OAuth] User insert error:", insertErr.message);
                throw insertErr;
            }

            userId = usrId;
            workspaceId = wsId;
            userRole = "OWNER";

            console.log("[Google OAuth] Created user:", userId, "workspace:", workspaceId);
        }

        // ── 4. Sign session token ─────────────────────────────────────────
        const sessionToken = await signToken({
            userId,
            workspaceId,
            role: userRole
        });

        // ── 5. Redirect to dashboard ──────────────────────────────────────
        const redirectTarget = new URL("/dashboard", PUBLIC_URL);
        console.log("[Google OAuth] ✅ Success — redirecting to:", redirectTarget.toString());

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
        console.error("[Google OAuth] Fatal error:", err?.message);
        console.error("[Google OAuth] Stack:", err?.stack);
        return NextResponse.redirect(
            new URL("/login?error=" + encodeURIComponent(err?.message || "Authentication error"), PUBLIC_URL)
        );
    }
}
