import crypto from "crypto";

/**
 * Encryption utility for securing sensitive credentials like
 * WhatsApp Access Tokens and App Secrets.
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "";
const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const TAG_LENGTH = 16;

/**
 * Encrypt a string using AES-256-GCM
 */
export function encrypt(text: string): string {
    if (!text) return "";
    if (!ENCRYPTION_KEY) {
        console.error("CRITICAL: ENCRYPTION_KEY is missing from environment variables.");
        throw new Error("Encryption key not configured");
    }

    try {
        // Use the hex key directly as a buffer
        const key = Buffer.from(ENCRYPTION_KEY, "hex");
        if (key.length !== 32) {
            throw new Error("ENCRYPTION_KEY must be a 64-character hex string (32 bytes)");
        }

        const iv = crypto.randomBytes(IV_LENGTH);
        const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

        let encrypted = cipher.update(text, "utf8", "hex");
        encrypted += cipher.final("hex");

        const tag = cipher.getAuthTag();

        // Format: iv:tag:encrypted (Hex encoded)
        return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`;
    } catch (error: any) {
        console.error("Encryption failed:", error.message);
        throw new Error("Could not encrypt data");
    }
}

/**
 * Decrypt a string using AES-256-GCM
 */
export function decrypt(cipherText: string): string {
    if (!cipherText) return "";

    // Fallback for non-encrypted legacy data
    if (!cipherText.includes(":") || cipherText.split(":").length !== 3) {
        return cipherText;
    }

    if (!ENCRYPTION_KEY) {
        throw new Error("Encryption key not configured");
    }

    try {
        const key = Buffer.from(ENCRYPTION_KEY, "hex");

        const [ivHex, tagHex, encryptedData] = cipherText.split(":");
        const iv = Buffer.from(ivHex, "hex");
        const tag = Buffer.from(tagHex, "hex");

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(encryptedData, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (error: any) {
        console.error("Decryption failed:", error.message);
        // If decryption fails but it LOOKED like encrypted data, return original for safety 
        // to handle cases where it might just be a string with colons
        return cipherText;
    }
}

/**
 * Mask a sensitive token for display in the UI
 * e.g. "sk_live_v1_abc123..." -> "sk_l...c123"
 */
export function maskToken(token: string, prefixLength: number = 4, suffixLength: number = 4): string {
    if (!token) return "";
    if (token.length <= prefixLength + suffixLength) return "********";

    const prefix = token.substring(0, prefixLength);
    const suffix = token.substring(token.length - suffixLength);

    return `${prefix}***************${suffix}`;
}
