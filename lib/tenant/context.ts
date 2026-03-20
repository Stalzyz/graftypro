
import { headers } from "next/headers";

export function getTenantId(): string | null {
    const h = headers();
    return h.get("x-tenant-id");
}

export function getTenantBranding() {
    const h = headers();
    const brandingStr = h.get("x-tenant-branding");
    if (!brandingStr) return null;
    
    try {
        return JSON.parse(brandingStr);
    } catch (e) {
        return null;
    }
}

export function isWhiteLabeled(): boolean {
    return !!getTenantId();
}
