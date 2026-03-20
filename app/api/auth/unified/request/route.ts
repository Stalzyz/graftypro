
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { prisma } from "../../../../../lib/db";
import { AuthSecurityService } from "../../../../../lib/security/auth-utils";
import { RateLimiter } from "../../../../../lib/security/rate-limit";
import { OTPService } from "../../../../../lib/services/otp-service";

export const dynamic = 'force-dynamic';

/**
 * Modern SaaS Unified Auth Request
 * Handles both Login and Signup initiation via OTP
 */
export async function POST(req: Request) {
    const headersList = headers();
    const ip = headersList.get("x-forwarded-for") || "unknown";
    const userAgent = headersList.get("user-agent") || "unknown";

    try {
        const { email: rawEmail } = await req.json();

        if (!rawEmail) {
            return NextResponse.json({ error: "Email identity required." }, { status: 400 });
        }

        const email = AuthSecurityService.normalizeEmail(rawEmail);

        // 1. ABUSE PREVENTION: Rate Limiting
        const isIpRestricted = await RateLimiter.isRestricted(`auth_req_ip:${ip}`, 20, 3600); // 20 requests/hr
        const isEmailRestricted = await RateLimiter.isRestricted(`auth_req_email:${email}`, 5, 1800); // 5 requests/30min

        if (isIpRestricted || isEmailRestricted) {
            return NextResponse.json({ error: "Verification system busy. Please try again later." }, { status: 429 });
        }

        // 2. IDENTITY VALIDITY & SPAM PROTECTION
        if (AuthSecurityService.isDisposableEmail(email)) {
            return NextResponse.json({ error: "Temporary emails are prohibited." }, { status: 403 });
        }

        const hasMX = await AuthSecurityService.hasValidMX(email);
        if (!hasMX && process.env.NODE_ENV === "production") {
            return NextResponse.json({ error: "Invalid email domain. Cannot deliver security code." }, { status: 403 });
        }

        // 3. ACCOUNT LOOKUP OR CREATION
        let user = await prisma.user.findFirst({
            where: { email },
            include: { workspace: true }
        });

        if (!user) {
            // Frictionless Signup: Create temporary placeholder account
            user = await prisma.$transaction(async (tx) => {
                const existingLock = await tx.trialLock.findUnique({
                    where: { email }
                });

                let finalTrialEndsAt: Date;

                if (existingLock) {
                    finalTrialEndsAt = existingLock.trial_ends_at;
                } else {
                    finalTrialEndsAt = new Date();
                    finalTrialEndsAt.setDate(finalTrialEndsAt.getDate() + 7); // Standardize to 7 days
                    await tx.trialLock.create({
                        data: {
                            email,
                            trial_ends_at: finalTrialEndsAt
                        }
                    });
                }

                const workspace = await tx.workspace.create({
                    data: {
                        name: "My Workspace",
                        status: "ACTIVE",
                        trial_ends_at: finalTrialEndsAt
                    }
                });

                return await tx.user.create({
                    data: {
                        workspace_id: workspace.id,
                        email,
                        first_name: "",
                        last_name: "",
                        role: "OWNER"
                    },
                    include: { workspace: true }
                });
            });

            await AuthSecurityService.logEvent({
                email, action: "SIGNUP", status: "SUCCESS", ipAddress: ip, userAgent,
                details: { msg: "Passwordless placeholder account created" }
            });
        }

        // 4. DISPATCH OTP
        await OTPService.sendOTP(email, "EMAIL", user.workspace_id);

        return NextResponse.json({
            success: true,
            message: "A single-use security code has been dispatched to your email.",
            email: user.email
        });

    } catch (error: any) {
        console.error("UNIFIED AUTH REQUEST ERROR:", error);

        let errorMessage = "Authentication system error. Please try again.";

        if (error.message?.includes("SMTP") || error.message?.includes("email")) {
            errorMessage = "Email service unavailable. Please contact support.";
        } else if (error.message?.includes("database") || error.message?.includes("Prisma")) {
            errorMessage = "Database connection error. Please try again shortly.";
        } else if (error.message?.includes("Redis")) {
            errorMessage = "Rate limiting service unavailable. Please try again.";
        }

        return NextResponse.json({
            error: errorMessage,
            debug_info: process.env.NODE_ENV === "development" ? error.message : undefined
        }, { status: 500 });
    }
}
