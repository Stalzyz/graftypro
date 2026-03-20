
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getResellerSession } from "@/lib/reseller/auth-helper";
import { DnsService } from "@/lib/reseller/dns-service";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getResellerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        let domain: string | null = null;

        if (params.id === "legacy") {
            const reseller = await prisma.reseller.findUnique({
                where: { id: session.userId },
                select: { custom_domain: true }
            });
            domain = reseller?.custom_domain || null;
        } else {
            const domainRecord = await prisma.partnerDomain.findUnique({
                where: { id: params.id }
            });
            if (domainRecord && domainRecord.reseller_id === session.userId) {
                domain = domainRecord.domain;
            }
        }

        if (!domain) return NextResponse.json({ error: "Domain not found" }, { status: 404 });

        // Perform SSL Handshake check
        const result = await DnsService.verifySslHandshake(domain);

        if (result.success) {
            return NextResponse.json({ 
                success: true, 
                message: "SSL Protocol Active & Secure" 
            });
        } else {
            return NextResponse.json({ 
                success: false, 
                error: result.error || "SSL Handshake Failed",
                tip: "Ensure DNS is fully propagated and your proxy is configured for HTTPS."
            }, { status: 422 });
        }

    } catch (error) {
        console.error("SSL Verify Error:", error);
        return NextResponse.json({ error: "SSL scanning failed" }, { status: 500 });
    }
}
