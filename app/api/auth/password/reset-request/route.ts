
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { AuthSecurityService } from "../../../../../lib/security/auth-utils";
import { OTPService } from "../../../../../lib/services/otp-service";
import { RateLimiter } from "../../../../../lib/security/rate-limit";
import { headers } from "next/headers";

export const dynamic = 'force-dynamic';

/**
 * Initiate Password Reset via Security OTP
 */
export async function POST(req: Request) {
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    try {
        const { email: rawEmail } = await req.json();
        const email = AuthSecurityService.normalizeEmail(rawEmail || "");

        if (!email) {
            return NextResponse.json({ error: "Identity identifier required" }, { status: 400 });
        }

        // Rate limit reset requests per email
        const isLimited = await RateLimiter.isRestricted(`pass_reset:${email}`, 3, 3600);
        if (isLimited) {
            return NextResponse.json({ error: "Too many reset requests. Check your email or try later." }, { status: 429 });
        }

        const host = headersList.get("x-request-host") || headersList.get("host") || "";
        const user = await prisma.user.findFirst({ where: { email } });

        // Security: Always return success even if user not found (Prevent ID enumeration)
        if (user) {
            await OTPService.sendOTP(email, "EMAIL", user.workspace_id, host);
            await AuthSecurityService.logEvent({
                userId: user.id, email, action: "PASS_RESET", status: "SUCCESS",
                ipAddress: ip, userAgent, details: { step: "REQUEST_SENT" }
            });
        }

        return NextResponse.json({
            success: true,
            message: "If an account exists, a secure verification code has been dispatched."
        });

    } catch (error: any) {
        console.error("Pass Reset Request Error:", error);
        return NextResponse.json({ error: "Identity verification service unavailable" }, { status: 500 });
    }
}
