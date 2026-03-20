
import { prisma } from "../db";
import crypto from "crypto";
import * as dns from "dns/promises";

/**
 * Security Logic for Authentication & Identity
 */
export class AuthSecurityService {

    /**
     * Normalize email for consistent lookup
     * Strips whitespace, lowercase, and removes sub-addressing (+tags) for common providers
     */
    static normalizeEmail(email: string): string {
        let normalized = email.trim().toLowerCase();
        
        // Handle Gmail sub-addressing (e.g., user+tag@gmail.com -> user@gmail.com)
        if (normalized.includes('+') && normalized.includes('@')) {
            const [local, domain] = normalized.split('@');
            if (domain === 'gmail.com' || domain === 'googlemail.com' || domain === 'outlook.com' || domain === 'hotmail.com') {
                const baseLocal = local.split('+')[0];
                normalized = `${baseLocal}@${domain}`;
            }
        }
        
        return normalized;
    }

    /**
     * Validate if an email is a company email (no Gmail/Yahoo/etc)
     */
    static isCompanyEmail(email: string): boolean {
        const disposableDomains = [
            "gmail.com", "yahoo.com", "outlook.com", "hotmail.com",
            "icloud.com", "me.com", "aol.com", "protonmail.com", "mail.com"
        ];

        const domain = email.split("@")[1];
        if (!domain) return false;

        return !disposableDomains.includes(domain.toLowerCase());
    }

    /**
     * Validate DNS MX records for a domain to prevent spam signups
     */
    static async hasValidMX(email: string): Promise<boolean> {
        const domain = email.split("@")[1]?.toLowerCase();
        if (!domain) return false;

        // 1. Whitelist common providers to skip DNS checks (Avoid flakiness)
        const commonProviders = ["gmail.com", "yahoo.com", "outlook.com", "hotmail.com", "icloud.com", "me.com"];
        if (commonProviders.includes(domain)) return true;

        try {
            if (domain.length < 4 || !domain.includes(".")) return false;

            // 2. Try MX Records first
            const mxRecords = await dns.resolve(domain, "MX").catch(() => []);
            if (mxRecords && mxRecords.length > 0) return true;

            // 3. Fallback to A record (some domains deliver mail to primary domain IPs)
            const aRecords = await dns.resolve(domain, "A").catch(() => []);
            if (aRecords && aRecords.length > 0) return true;

            return false;
        } catch (e) {
            console.warn(`[Security Alert] DNS resolution flaky for ${domain}. Failing open to prevent lockout.`);
            return true; // Fail open if DNS system is unreachable
        }
    }

    /**
     * Check if email domain is a known disposable email provider
     */
    static isDisposableEmail(email: string): boolean {
        const disposableProviders = [
            "mailinator.com", "temp-mail.org", "10minutemail.com",
            "guerrillamail.com", "yopmail.com", "dispostable.com"
        ];
        const domain = email.split("@")[1];
        return disposableProviders.includes(domain.toLowerCase());
    }

    /**
     * Generate a high-entropy 6-digit OTP
     */
    static generateOTP(): string {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }

    /**
     * Hash a token for secure storage (e.g. Remember Me, OTP)
     */
    static hashToken(token: string): string {
        return crypto.createHash("sha256").update(token).digest("hex");
    }

    /**
     * Hash a password using bcrypt
     */
    static async hashPassword(password: string): Promise<string> {
        const bcrypt = await import("bcryptjs");
        return bcrypt.hash(password, 12);
    }

    /**
     * Compare a plain password with a hashed password
     */
    static async comparePassword(plain: string, hashed: string): Promise<boolean> {
        const bcrypt = await import("bcryptjs");
        return bcrypt.compare(plain, hashed);
    }

    /**
     * Record an Auth Audit Event
     */
    static async logEvent(data: {
        userId?: string;
        email: string;
        action: "LOGIN_SUCCESS" | "LOGIN_FAILURE" | "GOOGLE_LOGIN" | "OTP_VERIFY" | "PASS_RESET" | "ACCOUNT_LOCK" | "SIGNUP" | "LOGOUT";
        status: "SUCCESS" | "FAILURE";
        ipAddress?: string;
        userAgent?: string;
        details?: any;
    }) {
        try {
            await prisma.authAuditLog.create({
                data: {
                    user_id: data.userId,
                    email: data.email,
                    action: data.action,
                    status: data.status,
                    ip_address: data.ipAddress || "0.0.0.0",
                    user_agent: data.userAgent || "Unknown",
                    details: data.details || {}
                }
            });
        } catch (e) {
            console.error("Failed to log auth event:", e);
        }
    }
}
