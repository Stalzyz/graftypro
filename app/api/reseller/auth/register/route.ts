
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { AuthSecurityService } from "../../../../../lib/security/auth-utils";
import { EmailService } from "../../../../../lib/email/service";
import { OTPService } from "../../../../../lib/services/otp-service";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password, confirmPassword, name, businessName } = body;

        // 1. Validate Inputs
        if (!email || !password || !confirmPassword || !name || !businessName) {
            return NextResponse.json({ error: "All fields are required" }, { status: 400 });
        }

        if (password !== confirmPassword) {
            return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
        }

        if (password.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
        }

        const normalizedEmail = AuthSecurityService.normalizeEmail(email);

        // 2. Check if Reseller already exists
        const existingReseller = await prisma.reseller.findUnique({
            where: { email: normalizedEmail }
        });

        if (existingReseller) {
            return NextResponse.json({ error: "Email already registered" }, { status: 409 });
        }

        // 3. Generate Referral Code (e.g., GRAFTY-XXXX)
        const referralCode = `GRFT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        // 4. Hash Password
        const passwordHash = await AuthSecurityService.hashPassword(password);

        // 5. Create Reseller (PENDING & UNVERIFIED)
        const reseller = await prisma.reseller.create({
            data: {
                email: normalizedEmail,
                password_hash: passwordHash,
                name: name,
                business_name: businessName,
                referral_code: referralCode,
                status: "PENDING",
                // @ts-ignore
                email_verified: false,
                base_commission: 20.00,
            }
        });

        // 6. Send OTP via centralized service
        let otpSent = true;
        try {
            await OTPService.sendOTP(normalizedEmail, "EMAIL");
        } catch (otpErr: any) {
            console.warn("Reseller Created but OTP Failed:", otpErr.message);
            otpSent = false;
        }


        // 7. Audit Log
        const ip = request.headers.get("x-forwarded-for") || "unknown";
        await AuthSecurityService.logEvent({
            email: normalizedEmail,
            action: "SIGNUP",
            status: "SUCCESS",
            ipAddress: ip,
            userAgent: request.headers.get("user-agent") || undefined,
            details: { type: "RESELLER", otp_sent: otpSent }
        });

        if (!otpSent) {
            return NextResponse.json({
                success: true,
                message: "Account created but we couldn't send the verification email. Please click 'Resend OTP' on the next screen.",
                email: normalizedEmail,
                resellerId: reseller.id,
                otpError: true
            });
        }

        return NextResponse.json({
            success: true,
            message: "Registration successful. Please verify your email with the OTP sent.",
            email: normalizedEmail,
            resellerId: reseller.id
        });

    } catch (error: any) {
        console.error("Reseller Registration Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
