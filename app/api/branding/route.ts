import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { getCurrentUser } from "../../../lib/auth";
import { BrandingService } from "../../../lib/branding/service";

export const dynamic = "force-dynamic";

/**
 * PUBLIC/WORKSPACE BRANDING RESOLVER
 * Fetches branding for the current session's workspace.
 */
export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        const host = req.headers.get("x-request-host") || "";
        console.log("🔍 Branding Resolver Host:", host);

        // 1. Priority: If logged in, get workspace branding
        if (user?.workspaceId) {
            const wsBranding = await BrandingService.getBrandingForWorkspace(user.workspaceId);
            if (wsBranding?.is_white_labeled) {
                return NextResponse.json({ success: true, data: wsBranding });
            }
        }

        // 2. Secondary: Resolve by Domain (pre-auth or different URL)
        if (host) {
            const domainBranding = await BrandingService.getBrandingByDomain(host);
            if (domainBranding) return NextResponse.json({ success: true, data: domainBranding });
        }

        // 3. Fallback: System Default
        const fallback = await BrandingService.getBrandingForWorkspace("");
        return NextResponse.json({ success: true, data: fallback, resolvedHost: host });

    } catch (error: any) {
        console.error("Branding Resolver Error:", error);
        return NextResponse.json({ error: "Failed to resolve branding" }, { status: 500 });
    }
}
