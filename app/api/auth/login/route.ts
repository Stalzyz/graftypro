
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { AuthSecurityService } from "../../../../lib/security/auth-utils";
import { RateLimiter } from "../../../../lib/security/rate-limit";
import { signToken } from "../../../../lib/auth";

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

        // 2. Find User
        const user = await prisma.user.findFirst({
            where: { email: normalizedEmail } // removed workspace_id constraint to find global user first
        });

        if (!user) {
            // Don't leak user existence
            await RateLimiter.isRestricted(`login:${ip}`, 5, 60); // Increment counter anyway
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // 3. Verify Password
        if (!user.password_hash || user.password_hash === "GOOGLE_OAUTH_NO_PASSWORD") {
            return NextResponse.json({ error: "This account uses Google login. Please click 'Continue with Google'." }, { status: 400 });
        }

        const isValid = await AuthSecurityService.comparePassword(password, user.password_hash);

        if (!isValid) {
            // Log failure
            await AuthSecurityService.logEvent({
                userId: user.id || undefined,
                email: normalizedEmail,
                action: "LOGIN_FAILURE",
                status: "FAILURE",
                ipAddress: ip,
                userAgent: request.headers.get("user-agent") || undefined
            });
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
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
            workspaceId: user.workspace_id,
            role: user.role
        });

        // 6. Set Cookie & Return
        const response = NextResponse.json({ success: true, redirect: "/dashboard" });
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

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
