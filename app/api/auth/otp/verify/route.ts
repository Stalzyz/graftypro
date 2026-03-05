
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { signToken } from "../../../../../lib/auth";
import { OTPService } from "../../../../../lib/services/otp-service";
import { AuthSecurityService } from "../../../../../lib/security/auth-utils";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * Modernized Verification Endpoint
 * Handles Identity Confirmation and Session Promotion
 */
export async function POST(req: Request) {
    try {
        const { identifier, code, issueSession } = await req.json();

        if (!identifier || !code) {
            return NextResponse.json({ error: "Identity identifier and security code required." }, { status: 400 });
        }

        // 1. Cryptographic Verification of Code
        const result = await OTPService.verifyOTP(identifier, code);
        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 401 });
        }

        // 2. Identify and Update Subject
        const user = await prisma.user.findFirst({
            where: { email: AuthSecurityService.normalizeEmail(identifier) }
        });

        if (user) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    email_otp_verified: true,
                    email_verified: new Date() // Sync classic verification field
                }
            });

            // 3. Conditional Session Authorization (Login/Register Promotion)
            if (issueSession) {
                const token = await signToken({
                    userId: user.id,
                    workspaceId: user.workspace_id,
                    role: user.role,
                    jit: crypto.randomBytes(16).toString("hex")
                });

                const response = NextResponse.json({
                    success: true,
                    message: "Identity confirmed. Session authorized.",
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role
                    }
                });

                // Set hardened cookie
                response.cookies.set("token", token, {
                    httpOnly: true,
                    secure: true,
                    sameSite: "strict",
                    maxAge: 60 * 60 * 24, // 1 Day
                    path: "/",
                });

                return response;
            }
        }

        return NextResponse.json({
            success: true,
            message: "Identity verification successful."
        });

    } catch (error: any) {
        console.error("CRITICAL VERIFICATION ENGINE ERROR:", error);
        return NextResponse.json({ error: "Verification system malfunction. Contact Security." }, { status: 500 });
    }
}
