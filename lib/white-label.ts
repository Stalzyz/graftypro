
import { prisma } from "./db";

export interface PartnerBranding {
    name: string;
    logo_url: string;
    favicon_url: string;
    primary_color: string;
    secondary_color: string;
    support_email: string;
}

export async function resolvePartnerByDomain(host: string) {
    if (!host) return null;

    // Normalize domain: strip port and convert to lowercase
    const domain = host.split(':')[0].toLowerCase().trim();

    // 1. Try resolving via Reseller custom_domain (Priority)
    let reseller = await prisma.reseller.findFirst({
        where: { custom_domain: domain },
        select: {
            id: true,
            name: true,
            business_name: true,
            brand_name: true,
            logo_url: true,
            favicon_url: true,
            primary_color: true,
            secondary_color: true,
            branding_settings: true,
            email: true
        }
    });

    // 2. Fallback: Search in PartnerDomain mapping
    if (!reseller) {
        const partnerDomain = await prisma.partnerDomain.findUnique({
            where: { domain: domain },
            include: {
                reseller: {
                    select: {
                        id: true,
                        name: true,
                        business_name: true,
                        brand_name: true,
                        logo_url: true,
                        favicon_url: true,
                        primary_color: true,
                        secondary_color: true,
                        branding_settings: true,
                        email: true
                    }
                }
            }
        });

        if (partnerDomain?.reseller && partnerDomain.is_verified) {
            reseller = partnerDomain.reseller as any;
        }
    }

    if (!reseller) return null;

    const branding: PartnerBranding = {
        name: reseller.brand_name || reseller.business_name || reseller.name,
        logo_url: reseller.logo_url || "",
        favicon_url: reseller.favicon_url || "",
        primary_color: reseller.primary_color || "#0F172A",
        secondary_color: reseller.secondary_color || "#3B82F6",
        support_email: reseller.email || ""
    };

    // Override with branding_settings if exists
    if (reseller.branding_settings) {
        const settings = reseller.branding_settings as any;
        if (settings.logo_url) branding.logo_url = settings.logo_url;
        if (settings.primary_color) branding.primary_color = settings.primary_color;
        if (settings.name) branding.name = settings.name;
    }

    return {
        id: reseller.id,
        branding
    };
}
