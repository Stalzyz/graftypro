import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { AuthSecurityService } from "@/lib/security/auth-utils";
import { OTPService } from "@/lib/services/otp-service";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email } = await req.json();
        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const reseller = await prisma.reseller.findUnique({
            where: { email: normalizedEmail }
        });

        if (!reseller) {
            // Give ambiguous success for security
            return NextResponse.json({ success: true, message: "If the email is registered, an OTP will be sent." });
        }

        await OTPService.sendOTP(normalizedEmail, "EMAIL");

        return NextResponse.json({
            success: true,
            message: "If the email is registered, an OTP has been sent."
        });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { email, otp, newPassword } = await req.json();

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ error: "Email, OTP and New Password are required" }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();

        const isValid = await OTPService.verifyOTP(normalizedEmail, otp);
        if (!isValid) {
            return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 400 });
        }

        const passwordHash = await AuthSecurityService.hashPassword(newPassword);

        await prisma.reseller.update({
            where: { email: normalizedEmail },
            data: { password_hash: passwordHash }
        });

        return NextResponse.json({
            success: true,
            message: "Password reset successfully. You can now login."
        });

    } catch (error) {
        console.error("Reset Password Error:", error);
        return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
    }
}
