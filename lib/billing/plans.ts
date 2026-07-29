
/**
 * Maps dynamic Package names to the strict Prisma Enum.
 * Essential for preserving database integrity while allowing flexible Plan naming.
 */
export function normalizePlanEnum(name: string): "FREE" | "PRO" | "ENTERPRISE" {
    const n = (name || "").toUpperCase().trim();
    
    // Exact Matches
    if (n === "FREE") return "FREE";
    if (n === "ENTERPRISE") return "ENTERPRISE";
    if (n === "PRO") return "PRO";

    // Enterprise Proxies (High value or specific keywords)
    if (n.includes("ELITE") || n.includes("ULTIMATE") || n.includes("WHITE") || n.includes("LABEL") || n.includes("WHI")) {
        return "ENTERPRISE";
    }

    // Free / Starter Tier — must be checked BEFORE the PRO default
    // Covers: "STARTER FREE", "STARTER", "FREE STARTER", "BASIC FREE"
    if (n.includes("FREE") || n.includes("STARTER") || n === "BASIC") {
        return "FREE";
    }

    // Default everything else to PRO (e.g. GROWTH, STANDARD, SCALE, ADVANCED)
    return "PRO";
}
