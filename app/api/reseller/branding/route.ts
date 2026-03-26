import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getResellerSession } from "@/lib/reseller/auth-helper";
import { getAbsoluteMediaUrl } from "@/lib/utils/url";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const reseller = await prisma.reseller.findUnique({
            where: { id: session.userId },
            select: {
                brand_name: true,
                logo_url: true,
                favicon_url: true,
                primary_color: true,
                secondary_color: true,
                support_email: true,
                support_url: true,
                support_whatsapp: true,
                custom_domain: true,
                smtp_config: true,
                // @ts-ignore
                role: true
            }
        });

        if (!reseller) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        const normalizedReseller = {
            ...reseller,
            logo_url: getAbsoluteMediaUrl(reseller.logo_url, req),
            favicon_url: getAbsoluteMediaUrl(reseller.favicon_url, req)
        };

        // Allow any partner role to READ branding
        return NextResponse.json({ data: normalizedReseller });

    } catch (error) {
        console.error("GET Branding Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const {
            brand_name, logo_url, favicon_url, primary_color, secondary_color,
            support_email, support_url, support_whatsapp,
            custom_domain, smtp_config, domain_verified,
            broadcast_banner, broadcast_link
        } = body;

        // Build update payload — only include fields that were sent
        const updateData: any = {};
        if (brand_name !== undefined) updateData.brand_name = brand_name;
        if (logo_url !== undefined) updateData.logo_url = logo_url;
        if (favicon_url !== undefined) updateData.favicon_url = favicon_url;
        if (primary_color !== undefined) updateData.primary_color = primary_color;
        if (secondary_color !== undefined) updateData.secondary_color = secondary_color;
        if (support_email !== undefined) updateData.support_email = support_email;
        if (support_url !== undefined) updateData.support_url = support_url;
        if (support_whatsapp !== undefined) updateData.support_whatsapp = support_whatsapp;
        if (broadcast_banner !== undefined) updateData.broadcast_banner = broadcast_banner;
        if (broadcast_link !== undefined) updateData.broadcast_link = broadcast_link;
        if (custom_domain !== undefined) updateData.custom_domain = custom_domain || null;
        if (smtp_config !== undefined) {
            const config = { ...smtp_config };
            if (config.pass) {
                const { encrypt } = require("@/lib/security/encryption");
                config.pass_enc = encrypt(config.pass);
                delete config.pass;
            }
            updateData.smtp_config = config;
        }
        // --------------------------------------------------------
        // DNS CROSS-CHECK (Security Hardening)
        // --------------------------------------------------------
        if (domain_verified === true) {
            const currentReseller = await prisma.reseller.findUnique({
                where: { id: session.userId },
                select: { custom_domain: true }
            });

            const targetDomain = custom_domain || currentReseller?.custom_domain;
            
            if (!targetDomain) {
                return NextResponse.json({ error: "No domain configured for verification." }, { status: 400 });
            }

            const { DnsService } = require("@/lib/reseller/dns-service");
            const expectedTarget = "cname.grafty.pro"; // Standard Platform Target
            
            const dnsResult = await DnsService.verifyCname(targetDomain, expectedTarget);
            
            if (!dnsResult.success) {
                console.warn(`[Security Alert] DNS verification failed for ${targetDomain}: ${dnsResult.error}`);
                return NextResponse.json({ 
                    error: "DNS Check Failed", 
                    details: dnsResult.error,
                    code: "DNS_MISMATCH"
                }, { status: 422 });
            }
            
            updateData.domain_verified = true;
            updateData.domain_settings = {
                verified_at: new Date(),
                method: "CNAME",
                target: expectedTarget
            };
        } else if (domain_verified === false) {
            updateData.domain_verified = false;
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ error: "No fields to update" }, { status: 400 });
        }

        const updated = await prisma.reseller.update({
            where: { id: session.userId },
            data: updateData
        });

        return NextResponse.json({ success: true, data: updated });

    } catch (error) {
        console.error("Update Branding Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
