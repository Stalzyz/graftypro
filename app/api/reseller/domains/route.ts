
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getResellerSession } from "@/lib/reseller/auth-helper";
import { v4 as uuidv4 } from "uuid";

export const dynamic = 'force-dynamic';

/**
 * GET: List all domains for the authenticated reseller
 */
export async function GET(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const [domains, reseller] = await Promise.all([
            prisma.partnerDomain.findMany({
                where: { reseller_id: session.userId },
                orderBy: { created_at: "desc" }
            }),
            prisma.reseller.findUnique({
                where: { id: session.userId },
                select: { custom_domain: true, domain_verified: true }
            })
        ]);

        // Check if legacy domain exists and is NOT in the PartnerDomain list
        const allDomains = [...domains];
        if (reseller?.custom_domain && !domains.some((d: any) => d.domain === reseller.custom_domain)) {
            allDomains.push({
                id: "legacy",
                reseller_id: session.userId,
                domain: reseller.custom_domain,
                is_verified: !!reseller.domain_verified,
                target_host: "cname.grafty.pro",
                created_at: new Date().toISOString(),
                // @ts-ignore
                is_legacy: true
            });
        }

        return NextResponse.json({ success: true, data: allDomains });

    } catch (error) {
        console.error("GET Domains Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

/**
 * POST: Register a new custom domain
 */
export async function POST(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { domain } = await req.json();
        if (!domain) return NextResponse.json({ error: "Domain is required" }, { status: 400 });

        // Normalize domain
        const normalizedDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, "").split("/")[0];

        // Basic validation
        if (!normalizedDomain.includes(".") || normalizedDomain.length < 4) {
            return NextResponse.json({ error: "Invalid domain format" }, { status: 400 });
        }

        // Check if already exists
        const existing = await prisma.partnerDomain.findUnique({
            where: { domain: normalizedDomain }
        });

        if (existing) {
            return NextResponse.json({ error: "This domain is already registered in our network" }, { status: 409 });
        }

        const newDomain = await prisma.partnerDomain.create({
            data: {
                reseller_id: session.userId,
                domain: normalizedDomain,
                verification_token: `wabot-verify-${uuidv4().substring(0, 8)}`,
                is_active: true,
                target_host: "cname.grafty.pro" // Default target
            }
        });

        return NextResponse.json({ success: true, data: newDomain });

    } catch (error) {
        console.error("POST Domain Error:", error);
        return NextResponse.json({ error: "Failed to register domain" }, { status: 500 });
    }
}
