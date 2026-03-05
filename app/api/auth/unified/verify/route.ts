
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { signToken } from "../../../../../lib/auth";
import { OTPService } from "../../../../../lib/services/otp-service";
import { AuthSecurityService } from "../../../../../lib/security/auth-utils";
import crypto from "crypto";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

/**
 * Modern SaaS Unified Auth Verification
 * Validates identity code and promotes to an authorized session
 */
export async function POST(req: Request) {
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    try {
        const { email, code, rememberMe } = await req.json();

        if (!email || !code) {
            return NextResponse.json({ error: "Identity email and security code required." }, { status: 400 });
        }

        const normalizedEmail = AuthSecurityService.normalizeEmail(email);

        // 1. Cryptographic Verification of Code
        const result = await OTPService.verifyOTP(normalizedEmail, code);
        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 401 });
        }

        // 2. Locate and Upgrade Subject
        const user = await prisma.user.findFirst({
            where: { email: normalizedEmail }
        });

        if (!user) {
            return NextResponse.json({ error: "Authenticated identity record lost. Please restart." }, { status: 404 });
        }

        // Update verification status and clear any lockout counters
        await prisma.user.update({
            where: { id: user.id },
            data: {
                email_otp_verified: true,
                email_verified: new Date(),
                failed_login_attempts: 0,
                locked_until: null,
                last_login_at: new Date(),
                last_login_ip: ip
            }
        });

        // 3. Issue High-Security Session Token
        const token = await signToken({
            userId: user.id,
            workspaceId: user.workspace_id,
            role: user.role,
            jit: crypto.randomBytes(16).toString("hex")
        });

        const response = NextResponse.json({
            success: true,
            message: "Identity confirmed. Access authorized.",
            user: {
                id: user.id,
                email: user.email,
                role: user.role
            }
        });

        // 4. Secure Cookie Configuration
        response.cookies.set("token", token, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 60 * 60 * 24, // 1 Day
            path: "/",
        });

        // 5. Persistent "Remember Me" logic (Optional but implemented for completeness)
        if (rememberMe) {
            const rememberToken = crypto.randomBytes(32).toString("hex");
            const hashedToken = AuthSecurityService.hashToken(rememberToken);

            await prisma.rememberMeToken.create({
                data: {
                    user_id: user.id,
                    token_hash: hashedToken,
                    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                }
            });

            response.cookies.set("remember_me", rememberToken, {
                httpOnly: true,
                secure: true,
                sameSite: "strict",
                maxAge: 60 * 60 * 24 * 30,
                path: "/",
            });
        }

        await AuthSecurityService.logEvent({
            userId: user.id, email: normalizedEmail, action: "LOGIN_SUCCESS", status: "SUCCESS", ipAddress: ip, userAgent
        });

        return response;

    } catch (error: any) {
        console.error("UNIFIED VERIFICATION ERROR:", error);
        return NextResponse.json({ error: "Identity verification engine error." }, { status: 500 });
    }
}
