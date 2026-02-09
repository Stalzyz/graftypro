import { prisma } from "@/lib/db";
import { WhatsAppService } from "@/lib/whatsapp/service";
import { EmailService } from "@/lib/email/service";

export class OTPService {
    /**
     * Generate and send a 6-digit OTP
     */
    static async sendOTP(identifier: string, type: 'EMAIL' | 'PHONE', workspaceId?: string) {
        // 1. Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Valid for 10 mins

        // 2. Clear old OTPs for this identifier
        await prisma.verificationOTP.deleteMany({
            where: { identifier }
        });

        // 3. Save new OTP
        await prisma.verificationOTP.create({
            data: {
                identifier,
                code,
                type,
                expires_at: expiresAt
            }
        });

        // 4. Dispatch via appropriate channel
        if (type === 'EMAIL') {
            // Branded Email via Wabot Engine
            if (workspaceId) {
                await EmailService.sendBrandedEmail(workspaceId, {
                    to: identifier,
                    subject: "Verification Code",
                    templateName: "OTP_VERIFICATION",
                    context: { otp: code }
                });
            } else {
                console.log(`[OTP Engine] System Email to ${identifier}: ${code}`);
            }
        } else {
            throw new Error("Only EMAIL verification is supported at this time.");
        }

        return { success: true };
    }

    /**
     * Validate an OTP
     */
    static async verifyOTP(identifier: string, code: string) {
        const otpRecord = await prisma.verificationOTP.findFirst({
            where: {
                identifier,
                code,
                expires_at: { gt: new Date() }
            }
        });

        if (!otpRecord) {
            return { success: false, error: "Invalid or expired verification code." };
        }

        // Delete after successful use
        await prisma.verificationOTP.delete({
            where: { id: otpRecord.id }
        });

        return { success: true };
    }
}
