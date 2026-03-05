
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { redis } from "../../../../lib/redis";
import { signToken } from "../../../../lib/auth";
import { AuthSecurityService } from "../../../../lib/security/auth-utils";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
        return NextResponse.json({ error: "Invalid token" }, { status: 400 });
    }

    try {
        const userId = await redis.get(`verify:${token}`);
        if (!userId) {
            return NextResponse.json({ error: "Invalid or expired verification link" }, { status: 400 });
        }

        // Verify User
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { workspace: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        if (user.email_verified) {
            // Already verified
            const protocol = request.headers.get("x-forwarded-proto") || "https";
            const host = request.headers.get("host") || "grafty.pro";
            const baseHost = (process.env.NODE_ENV === "production" && host.includes("localhost")) ? "grafty.pro" : host;
            return NextResponse.redirect(new URL(`${protocol}://${baseHost}/dashboard`));
        }

        // Update User
        await prisma.user.update({
            where: { id: userId },
            data: {
                email_verified: new Date(),
                email_otp_verified: true
            }
        });

        // Clean up token
        await redis.del(`verify:${token}`);

        // Create Session
        const sessionToken = await signToken({
            userId: user.id,
            workspaceId: user.workspace_id,
            role: user.role
        });

        // Construct Redirect URL correctly
        const protocol = request.headers.get("x-forwarded-proto") || "https";
        const host = request.headers.get("host") || "grafty.pro";
        const baseHost = (process.env.NODE_ENV === "production" && host.includes("localhost")) ? "grafty.pro" : host;
        const redirectUrl = `${protocol}://${baseHost}/dashboard?verified=true`;

        // Set Cookie
        const response = NextResponse.redirect(new URL(redirectUrl));
        response.cookies.set("token", sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7 // 7 days
        });

        // Log
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        await AuthSecurityService.logEvent({
            userId: user.id,
            email: user.email,
            action: "OTP_VERIFY", // Or EMAIL_VERIFY
            status: "SUCCESS",
            ipAddress: ip,
            userAgent: request.headers.get("user-agent") || undefined
        });

        return response;

    } catch (error) {
        console.error("Verification Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
