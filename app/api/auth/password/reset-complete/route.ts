
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { AuthSecurityService } from "../../../../../lib/security/auth-utils";
import { OTPService } from "../../../../../lib/services/otp-service";
import bcrypt from "bcryptjs";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

/**
 * Complete Password Reset with Verified OTP
 */
export async function POST(req: Request) {
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    try {
        const { email, otp, newPassword } = await req.json();

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ error: "High-entropy credentials required" }, { status: 400 });
        }

        // 1. Verify OTP
        const otpCheck = await OTPService.verifyOTP(email, otp);
        if (!otpCheck.success) {
            return NextResponse.json({ error: otpCheck.error }, { status: 401 });
        }

        // 2. Update Password
        const user = await prisma.user.findUnique({ where: { email: AuthSecurityService.normalizeEmail(email) } });
        if (!user) {
            return NextResponse.json({ error: "Identity core mismatch" }, { status: 404 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password_hash: hashedPassword,
                failed_login_attempts: 0,
                locked_until: null,
                email_otp_verified: new Date() // Mark verified if not already
            }
        });

        // 3. Clear all active sessions (Optional but safer)
        await prisma.rememberMeToken.deleteMany({ where: { user_id: user.id } });

        await AuthSecurityService.logEvent({
            userId: user.id, email, action: "PASS_RESET", status: "SUCCESS",
            ipAddress: ip, userAgent, details: { step: "COMPLETED" }
        });

        return NextResponse.json({ success: true, message: "Security credentials updated. You may now sign in." });

    } catch (error: any) {
        console.error("Pass Reset Finalize Error:", error);
        return NextResponse.json({ error: "Credential update failed" }, { status: 500 });
    }
}
