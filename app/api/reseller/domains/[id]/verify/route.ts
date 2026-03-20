
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getResellerSession } from "@/lib/reseller/auth-helper";
import { DnsService } from "@/lib/reseller/dns-service";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getResellerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        let domainRecord: any;
        let expectedTarget: string;
        let domainToVerify: string;

        if (params.id === "legacy") {
            const reseller = await prisma.reseller.findUnique({
                where: { id: session.userId },
                select: { custom_domain: true }
            });
            if (!reseller?.custom_domain) return NextResponse.json({ error: "No legacy domain found" }, { status: 404 });
            domainToVerify = reseller.custom_domain;
            expectedTarget = "cname.grafty.pro";
        } else {
            domainRecord = await prisma.partnerDomain.findUnique({
                where: { id: params.id }
            });

            if (!domainRecord || domainRecord.reseller_id !== session.userId) {
                return NextResponse.json({ error: "Domain not found" }, { status: 404 });
            }
            domainToVerify = domainRecord.domain;
            expectedTarget = domainRecord.target_host || "cname.grafty.pro";
        }
        
        // Use DnsService to verify CNAME
        const result = await DnsService.verifyCname(domainToVerify, expectedTarget);

        if (result.success) {
            if (params.id === "legacy") {
                await prisma.reseller.update({
                    where: { id: session.userId },
                    data: { domain_verified: true }
                });
            } else {
                await prisma.partnerDomain.update({
                    where: { id: params.id },
                    data: {
                        is_verified: true,
                        verified_at: new Date()
                    }
                });
            }

            return NextResponse.json({ 
                success: true, 
                message: "DNS Verified Successfully" 
            });
        } else {
            return NextResponse.json({ 
                success: false, 
                error: result.error || "CNAME mismatch",
                found: result.records
            }, { status: 422 });
        }

    } catch (error) {
        console.error("Domain Verify Error:", error);
        return NextResponse.json({ error: "Verification process failed" }, { status: 500 });
    }
}
