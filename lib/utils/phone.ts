/**
 * Standardizes phone numbers to raw digits only (no +, -, or spaces).
 * Used for database storage and webhook lookups.
 * 
 * Example: "+91 97893 59407" -> "919789359407"
 */
export function normalizePhone(phone: string): string {
    if (!phone) return "";
    return phone.replace(/\D/g, "");
}
