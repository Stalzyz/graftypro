import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const resellers = await prisma.reseller.findMany({
            select: { id: true, name: true, custom_domain: true, external_home_url: true, home_page_type: true }
        });

        const domains = await prisma.partnerDomain.findMany({
            select: { domain: true, reseller: { select: { name: true, external_home_url: true } } }
        });

        return NextResponse.json({
            status: "SUCCESS",
            resellersWithUrls: resellers.filter(r => r.external_home_url || r.home_page_type === "EXTERNAL"),
            partnerDomains: domains
        });
    } catch (error: any) {
        return NextResponse.json({ status: "ERROR", message: error.message }, { status: 500 });
    }
}
