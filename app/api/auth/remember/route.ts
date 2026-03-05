
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "../../../../lib/db";
import { signToken } from "../../../../lib/auth";
import { AuthSecurityService } from "../../../../lib/security/auth-utils";
import crypto from "crypto";

export const dynamic = 'force-dynamic';

/**
 * Handle Remember Me Session Persistence
 * Following Security Grade: Rotate token after use
 */
export async function POST(req: Request) {
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    try {
        const rememberToken = req.cookies.get("remember_me")?.value;

        if (!rememberToken) {
            return NextResponse.json({ error: "No persistence record found" }, { status: 401 });
        }

        const hashedToken = AuthSecurityService.hashToken(rememberToken);

        // Find and validate token
        const tokenRecord = await prisma.rememberMeToken.findUnique({
            where: { token_hash: hashedToken },
            include: { user: true }
        });

        if (!tokenRecord || tokenRecord.expires_at < new Date()) {
            if (tokenRecord) await prisma.rememberMeToken.delete({ where: { id: tokenRecord.id } });
            return NextResponse.json({ error: "Persistence record expired" }, { status: 401 });
        }

        const user = tokenRecord.user;

        // ROTATION: Delete old token and create new one
        await prisma.rememberMeToken.delete({ where: { id: tokenRecord.id } });

        const newRememberToken = crypto.randomBytes(32).toString("hex");
        const newHashedToken = AuthSecurityService.hashToken(newRememberToken);

        await prisma.rememberMeToken.create({
            data: {
                user_id: user.id,
                token_hash: newHashedToken,
                expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            }
        });

        // Generate new session token
        const sessionToken = await signToken({
            userId: user.id,
            workspaceId: user.workspace_id,
            role: user.role,
            jit: crypto.randomBytes(16).toString("hex")
        });

        await AuthSecurityService.logEvent({
            userId: user.id, email: user.email, action: "LOGIN_SUCCESS", status: "SUCCESS",
            ipAddress: ip, userAgent, details: { method: "REMEMBER_ME_ROTATION" }
        });

        const response = NextResponse.json({ success: true });

        // Update Cookies
        response.cookies.set("token", sessionToken, {
            httpOnly: true, secure: true, sameSite: "strict", maxAge: 60 * 60 * 24, path: "/"
        });

        response.cookies.set("remember_me", newRememberToken, {
            httpOnly: true, secure: true, sameSite: "strict", maxAge: 60 * 60 * 24 * 30, path: "/"
        });

        return response;

    } catch (error: any) {
        console.error("Remember Me Verification Error:", error);
        return NextResponse.json({ error: "Persistence verification failed" }, { status: 500 });
    }
}
