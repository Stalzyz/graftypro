
import { prisma } from "../db";
import { getAbsoluteMediaUrl } from "../utils/url";

export interface TenantBranding {
    name: string;
    brand_name?: string; // Added for compatibility
    logo_url: string | null;
    favicon_url: string | null;
    primary_color: string;
    secondary_color: string;
    home_page_type?: "DEFAULT" | "EXTERNAL" | "CUSTOM";
    external_home_url?: string | null;
    custom_home_html?: string | null;
    support_whatsapp?: string | null;
}

export interface TenantContext {
    partnerId: string;
    domain: string;
    branding: TenantBranding;
}

// Simple in-memory cache for domain resolution (1 minute TTL)
const cache: Record<string, { data: TenantContext | null; expires: number }> = {};
const CACHE_TTL = 60 * 1000;

export async function resolveTenantFromHost(host: string): Promise<TenantContext | null> {
    const now = Date.now();
    
    // 1. Check Cache
    if (cache[host] && cache[host].expires > now) {
        return cache[host].data;
    }

    try {
        // 2. Lookup in Database
        // Priority 1: PartnerDomain model (Multi-domain support)
        const partnerDomain = await prisma.partnerDomain.findUnique({
            where: { domain: host, is_verified: true, is_active: true },
            include: {
                reseller: {
                    select: {
                        id: true,
                        brand_name: true,
                        logo_url: true,
                        favicon_url: true,
                        primary_color: true,
                        secondary_color: true,
                        name: true,
                        home_page_type: true,
                        external_home_url: true,
                        custom_home_html: true,
                        support_whatsapp: true,
                    }
                }
            }
        });

        if (partnerDomain) {
            const reseller = partnerDomain.reseller as any;
            const context: TenantContext = {
                partnerId: partnerDomain.reseller_id,
                domain: host,
                branding: {
                    name: reseller.brand_name || reseller.name,
                    brand_name: reseller.brand_name || reseller.name,
                    logo_url: getAbsoluteMediaUrl(reseller.logo_url),
                    favicon_url: getAbsoluteMediaUrl(reseller.favicon_url),
                    primary_color: reseller.primary_color || "#0F172A",
                    secondary_color: reseller.secondary_color || "#3B82F6",
                    home_page_type: reseller.home_page_type,
                    external_home_url: reseller.external_home_url,
                    custom_home_html: reseller.custom_home_html,
                    support_whatsapp: reseller.support_whatsapp
                }
            };
            cache[host] = { data: context, expires: now + CACHE_TTL };
            return context;
        }

        // Priority 2: Legacy custom_domain on Reseller model
        const reseller = await prisma.reseller.findFirst({
            where: { custom_domain: host, domain_verified: true } as any,
            select: {
                id: true,
                brand_name: true,
                logo_url: true,
                favicon_url: true,
                primary_color: true,
                secondary_color: true,
                name: true,
                home_page_type: true,
                external_home_url: true,
                custom_home_html: true,
                support_whatsapp: true,
            } as any
        });

        if (reseller) {
            const r = reseller as any;
            const context: TenantContext = {
                partnerId: r.id,
                domain: host,
                branding: {
                    name: r.brand_name || r.name,
                    brand_name: r.brand_name || r.name,
                    logo_url: getAbsoluteMediaUrl(r.logo_url),
                    favicon_url: getAbsoluteMediaUrl(r.favicon_url),
                    primary_color: r.primary_color || "#0F172A",
                    secondary_color: r.secondary_color || "#3B82F6",
                    home_page_type: r.home_page_type || "DEFAULT",
                    external_home_url: r.external_home_url || null,
                    custom_home_html: r.custom_home_html || null,
                    support_whatsapp: r.support_whatsapp || null,
                }
            };
            cache[host] = { data: context, expires: now + CACHE_TTL };
            return context;
        }

        // 3. No Match
        cache[host] = { data: null, expires: now + CACHE_TTL };
        return null;

    } catch (error) {
        console.error(`[TenantResolver] Error resolving host ${host}:`, error);
        return null; // Fallback to main app (no tenant)
    }
}
