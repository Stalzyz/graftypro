
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { promises as dns } from "dns";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user || user.role !== "RESELLER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { domainId } = await req.json();
        if (!domainId) return NextResponse.json({ error: "Domain ID is required" }, { status: 400 });

        const partnerDomain = await prisma.partnerDomain.findUnique({
            where: { id: domainId, reseller_id: user.userId }
        });

        if (!partnerDomain) {
            return NextResponse.json({ error: "Domain not found" }, { status: 404 });
        }

        const domain = partnerDomain.domain;
        const targetHost = partnerDomain.target_host;

        let isCnameValid = false;
        let cnameError = "";

        try {
            // 1. Resolve CNAME
            const cnames = await dns.resolveCname(domain);
            console.log(`[DNS_VERIFY] Domain: ${domain}, Targets:`, cnames);
            
            // Check if any CNAME points to our target host
            isCnameValid = cnames.some(c => 
                c.toLowerCase().includes(targetHost.toLowerCase()) || 
                c.toLowerCase().includes("grafty.pro") ||
                c.toLowerCase().includes("grafty.app")
            );
            
            if (!isCnameValid) {
                cnameError = `CNAME points to ${cnames.join(", ")} instead of ${targetHost}`;
            }
        } catch (err: any) {
            console.error(`[DNS_VERIFY] Failed for ${domain}:`, err.message);
            cnameError = `DNS Resolution failed: ${err.code || err.message}`;
            
            // Fallback: Check if it's an A record pointing to our IP (advanced, but let's stick to CNAME for now as standard)
        }

        if (isCnameValid) {
            await prisma.partnerDomain.update({
                where: { id: domainId },
                data: {
                    is_verified: true,
                    verified_at: new Date(),
                    ssl_enabled: true // Manual assumption for now as we don't handle SSL issuance here
                }
            });

            return NextResponse.json({ success: true, message: "Domain verified successfully!" });
        } else {
            return NextResponse.json({ 
                success: false, 
                error: cnameError,
                details: "Please ensure your CNAME record is correctly pointed and DNS propagation has finished (can take up to 24 hours)."
            });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
