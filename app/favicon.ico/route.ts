import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
    const h = headers();
    const brandingStr = h.get("x-tenant-branding");
    
    let faviconUrl = "/grafty_icon.svg"; // Default fallback

    if (brandingStr) {
        try {
            const branding = JSON.parse(brandingStr);
            if (branding.favicon_url) {
                faviconUrl = branding.favicon_url;
            }
        } catch (e) {}
    }

    // Add cache-buster to bypass browser static caching
    const redirectUrl = faviconUrl.includes('?') ? `${faviconUrl}&v=monster` : `${faviconUrl}?v=monster`;

    // Redirect dynamically based on current Host to allow whitelabels to load nicely
    const host = h.get("host") || "grafty.pro";
    const protocol = h.get("x-forwarded-proto") || "https";
    
    return NextResponse.redirect(new URL(redirectUrl, `${protocol}://${host}`), {
        status: 302
    });
}
