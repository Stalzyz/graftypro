
import * as dns from "dns/promises";

/**
 * Enterprise DNS Verification Engine for White-Label Domains.
 * Provides robust CNAME and A record verification with propagation awareness.
 */
export class DnsService {
    /**
     * Verifies if a domain has the correct CNAME record pointing to our infrastructure.
     * @param domain The custom domain to check (e.g., portal.reseller.com)
     * @param expectedTarget The expected CNAME target (e.g., cname.grafty.pro)
     */
    static async verifyCname(domain: string, expectedTarget: string): Promise<{ success: boolean; records: string[]; error?: string }> {
        try {
            // Normalize domain
            const targetDomain = domain.toLowerCase().trim();
            const normalizedExpected = expectedTarget.toLowerCase().trim().replace(/\.$/, "");

            console.log(`[DnsService] Auditing CNAME for ${targetDomain} -> Expected: ${normalizedExpected}`);

            // 1. Resolve CNAME records
            const records = await dns.resolveCname(targetDomain).catch(() => []);
            
            // 2. Check for match (handling potential trailing dots in DNS responses)
            const isMatch = records.some(record => 
                record.toLowerCase().trim().replace(/\.$/, "") === normalizedExpected
            );

            if (isMatch) {
                return { success: true, records };
            }

            // 3. Fallback: Check A records (some users might use ALIAS or A records if allowed)
            // For now, we strictly require CNAME as per Wabot protocol
            return { 
                success: false, 
                records, 
                error: records.length > 0 
                    ? `Mismatch: Found [${records.join(", ")}], Expected [${normalizedExpected}]` 
                    : "No CNAME records found for this namespace." 
            };

        } catch (error: any) {
            console.error(`[DnsService] Verification Failure for ${domain}:`, error);
            return { success: false, records: [], error: error.message || "DNS Resolver Failure" };
        }
    }

    /**
     * Helper to perform a deep pulse check on propagation.
     */
    static async checkPropagation(domain: string): Promise<boolean> {
        try {
            const result = await dns.lookup(domain);
            return !!result.address;
        } catch {
            return false;
        }
    }

    /**
     * Verifies if a domain is responding correctly over HTTPS.
     */
    static async verifySslHandshake(domain: string): Promise<{ success: boolean; error?: string }> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const response = await fetch(`https://${domain}/api/health`, {
                method: "HEAD",
                signal: controller.signal
            }).catch(() => null);

            clearTimeout(timeoutId);

            if (response && response.status < 500) {
                return { success: true };
            }

            // If /api/health fails, try root
            const rootResponse = await fetch(`https://${domain}/`, {
                method: "HEAD",
                signal: controller.signal
            }).catch(() => null);

            if (rootResponse && rootResponse.status < 500) {
                return { success: true };
            }

            return { success: false, error: "Handshake refused or certificate invalid" };
        } catch (error: any) {
            return { success: false, error: error.message || "SSL Handshake Failure" };
        }
    }
}
