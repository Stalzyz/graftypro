
import { prisma } from "../db";

export interface TenantBranding {
    name: string;
    logo_url: string | null;
    favicon_url: string | null;
    primary_color: string;
    secondary_color: string;
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
                        name: true
                    }
                }
            }
        });

        if (partnerDomain) {
            const context: TenantContext = {
                partnerId: partnerDomain.reseller_id,
                domain: host,
                branding: {
                    name: partnerDomain.reseller.brand_name || partnerDomain.reseller.name,
                    logo_url: partnerDomain.reseller.logo_url,
                    favicon_url: partnerDomain.reseller.favicon_url,
                    primary_color: partnerDomain.reseller.primary_color || "#0F172A",
                    secondary_color: partnerDomain.reseller.secondary_color || "#3B82F6"
                }
            };
            cache[host] = { data: context, expires: now + CACHE_TTL };
            return context;
        }

        // Priority 2: Legacy custom_domain on Reseller model
        const reseller = await prisma.reseller.findFirst({
            where: { custom_domain: host, domain_verified: true },
            select: {
                id: true,
                brand_name: true,
                logo_url: true,
                favicon_url: true,
                primary_color: true,
                secondary_color: true,
                name: true
            }
        });

        if (reseller) {
            const context: TenantContext = {
                partnerId: reseller.id,
                domain: host,
                branding: {
                    name: reseller.brand_name || reseller.name,
                    logo_url: reseller.logo_url,
                    favicon_url: reseller.favicon_url,
                    primary_color: reseller.primary_color || "#0F172A",
                    secondary_color: reseller.secondary_color || "#3B82F6"
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
