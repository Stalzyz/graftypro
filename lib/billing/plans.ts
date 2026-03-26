
/**
 * Maps dynamic Package names to the strict Prisma Enum.
 * Essential for preserving database integrity while allowing flexible Plan naming.
 */
export function normalizePlanEnum(name: string): "FREE" | "PRO" | "ENTERPRISE" {
    const n = (name || "").toUpperCase();
    
    // Exact Matches
    if (n === "FREE") return "FREE";
    if (n === "ENTERPRISE") return "ENTERPRISE";
    
    // Enterprise Proxies (High value or specific keywords)
    if (n.includes("ELITE") || n.includes("ULTIMATE") || n.includes("WHI") || n.includes("LABEL")) {
        return "ENTERPRISE";
    }

    // Default everything else to PRO (e.g. STARTER, BASIC, GROWTH, STANDARD)
    // This unlocks core features while staying within the 3-tier DB constraint.
    return "PRO";
}
