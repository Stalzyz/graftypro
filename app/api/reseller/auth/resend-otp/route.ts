
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { AuthSecurityService } from "../../../../../lib/security/auth-utils";
import { EmailService } from "../../../../../lib/email/service";
import { OTPService } from "../../../../../lib/services/otp-service";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const normalizedEmail = AuthSecurityService.normalizeEmail(email);

        // 1. Check if reseller exists and is not verified
        const reseller = await prisma.reseller.findUnique({
            where: { email: normalizedEmail }
        });

        if (!reseller) {
            return NextResponse.json({ error: "Partner account not found" }, { status: 404 });
        }

        // @ts-ignore
        if (reseller.email_verified) {
            return NextResponse.json({ error: "Email is already verified" }, { status: 400 });
        }

        // 2. Clear old OTPs and Send NEW OTP via centralized service
        try {
            await OTPService.sendOTP(normalizedEmail, "EMAIL");
        } catch (otpErr: any) {
            return NextResponse.json({ error: otpErr.message || "Failed to dispatch verification code." }, { status: 429 });
        }


        return NextResponse.json({
            success: true,
            message: "A new verification code has been sent to your email."
        });

    } catch (error: any) {
        console.error("Resend OTP Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
