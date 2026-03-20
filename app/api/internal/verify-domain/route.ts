
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

/**
 * Internal API for Proxy (Caddy/Nginx) to verify if a domain should get an SSL cert.
 * This should only be accessible from localhost or via a secret key.
 */
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain");

    if (!domain) return new Response("Domain required", { status: 400 });

    try {
        // 1. Check if it's a partner domain in the new multi-domain table
        const partnerDomain = await prisma.partnerDomain.findUnique({
            where: { domain: domain.toLowerCase() },
            select: { is_verified: true }
        });

        if (partnerDomain?.is_verified) {
            return new Response("OK", { status: 200 });
        }

        // 2. Check if it's a legacy reseller domain
        const reseller = await prisma.reseller.findFirst({
            where: { custom_domain: domain.toLowerCase() },
            select: { domain_verified: true }
        });

        if (reseller?.domain_verified) {
            return new Response("OK", { status: 200 });
        }

        // 3. Fallback: If domain matches the primary domain, allow it
        const primaryDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || "grafty.pro";
        if (domain.endsWith(primaryDomain)) {
            return new Response("OK", { status: 200 });
        }

        return new Response("Forbidden", { status: 403 });

    } catch (error) {
        console.error("Internal Domain Verify Error:", error);
        return new Response("Error", { status: 500 });
    }
}
