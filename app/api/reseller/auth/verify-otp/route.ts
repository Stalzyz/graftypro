
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { AuthSecurityService } from "../../../../../lib/security/auth-utils";
import { OTPService } from "../../../../../lib/services/otp-service";

export async function POST(request: Request) {
    try {
        const { email, otp } = await request.json();
        console.log(`[VerifyOTP] Attempt for ${email} with code ${otp}`);

        if (!email || !otp) {
            return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
        }

        const normalizedEmail = AuthSecurityService.normalizeEmail(email);

        // 1. Verify OTP via centralized service
        const result = await OTPService.verifyOTP(normalizedEmail, otp);
        if (!result.success) {
            return NextResponse.json({ error: result.error || "Invalid verification code" }, { status: 400 });
        }

        // 2. Update Reseller Verification Status
        await prisma.reseller.update({
            where: { email: normalizedEmail },
            data: {
                // @ts-ignore
                email_verified: true,
                status: "ACTIVE" // Auto-activate on verification to fix login loops
            }
        });


        // 5. Audit Log
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        await AuthSecurityService.logEvent({
            email: normalizedEmail,
            action: "OTP_VERIFY",
            status: "SUCCESS",
            ipAddress: ip,
            details: { type: "RESELLER" }
        });

        return NextResponse.json({
            success: true,
            message: "Email verified successfully. You can now proceed to login and complete KYC."
        });

    } catch (error: any) {
        console.error("OTP Verification Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
