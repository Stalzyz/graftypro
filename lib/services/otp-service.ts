import { prisma } from "../db";
import { EmailService } from "../email/service";
import { AuthSecurityService } from "../security/auth-utils";
import { RateLimiter } from "../security/rate-limit";

export class OTPService {
    /**
     * Generate and send a 6-digit OTP with security hardening
     */
    static async sendOTP(identifier: string, type: 'EMAIL' | 'PHONE', workspaceId?: string) {
        // 1. Rate Limit Resend Attempts
        const isResendLimited = await RateLimiter.isRestricted(`otp_resend:${identifier}`, 3, 3600); // 3 per hour
        if (isResendLimited) {
            throw new Error("Maximum resend attempts reached. Please try again in an hour.");
        }

        const code = AuthSecurityService.generateOTP();
        const hashedCode = AuthSecurityService.hashToken(code);
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // 2. Clear old OTPs
        await prisma.verificationOTP.deleteMany({ where: { identifier } });

        // 3. Save hashed OTP
        await prisma.verificationOTP.create({
            data: {
                identifier,
                code: hashedCode,
                type,
                expires_at: expiresAt
            }
        });

        // 4. Dispatch
        if (type === 'EMAIL') {
            try {
                if (workspaceId) {
                    const result = await EmailService.sendBrandedEmail(workspaceId, {
                        to: identifier,
                        subject: "Your Security Verification Code",
                        templateName: "OTP_VERIFICATION",
                        context: { otp: code }
                    });
                    if (!result.success) throw new Error(result.error || "Failed to send branded email");
                } else {
                    // System-level email dispatch
                    const result = await EmailService.sendSystemEmail({
                        to: identifier,
                        subject: "Your Security Verification Code",
                        templateName: "OTP_VERIFICATION",
                        context: { otp: code }
                    });
                    if (!result.success) throw new Error(result.error || "Failed to send system email");
                }

                await AuthSecurityService.logEvent({
                    email: identifier, action: "OTP_VERIFY", status: "SUCCESS",
                    details: { channel: "EMAIL", msg: "OTP Sent" }
                });
            } catch (e: any) {
                console.error("OTP Dispatch Error:", e.message);
                throw new Error("Failed to deliver verification code.");
            }
        } else {
            throw new Error("Unsupported verification channel.");
        }

        return { success: true };
    }

    /**
     * Validate an OTP with attempt tracking
     */
    static async verifyOTP(identifier: string, code: string) {
        const hashedCode = AuthSecurityService.hashToken(code);

        // Rate limit attempts per identifier to prevent OTP brute force
        const isVerifyLimited = await RateLimiter.isRestricted(`otp_verify:${identifier}`, 5, 1800); // 5 tries per 30 mins
        if (isVerifyLimited) {
            return { success: false, error: "Too many failed verification attempts. Security lockout active." };
        }

        const otpRecord = await prisma.verificationOTP.findFirst({
            where: {
                identifier,
                code: hashedCode,
                expires_at: { gt: new Date() }
            }
        });

        if (!otpRecord) {
            await AuthSecurityService.logEvent({
                email: identifier, action: "OTP_VERIFY", status: "FAILURE",
                details: { reason: "Invalid or Expired Code" }
            });
            return { success: false, error: "Invalid or expired verification code." };
        }

        // Auto-delete after successful use
        await prisma.verificationOTP.delete({
            where: { id: otpRecord.id }
        });

        await AuthSecurityService.logEvent({
            email: identifier, action: "OTP_VERIFY", status: "SUCCESS",
            details: { msg: "Identity Confirmed via OTP" }
        });

        return { success: true };
    }
}
