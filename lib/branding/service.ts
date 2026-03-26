import { prisma } from "../db";
import { getAbsoluteMediaUrl } from "../utils/url";

export class BrandingService {
    /**
     * PHASE 1: BRAND RESOLVER
     * Finds the correct branding for a given workspace.
     * If workspace is linked to a reseller, return reseller branding.
     * Else, attempt to resolve by hostname.
     * Finally, return default platform (Grafty) branding.
     */
    static async getBrandingForWorkspace(workspaceId?: string, hostname?: string) {
        // Only try to fetch workspace specific branding if we have an ID
        if (workspaceId && workspaceId.trim() !== "") {
            try {
                const workspace = await prisma.workspace.findUnique({
                    where: { id: workspaceId },
                    include: {
                        reseller: true
                    }
                });

                if (workspace?.reseller) {
                    const r = workspace.reseller;
                    return {
                        is_white_labeled: true,
                        brand_name: r.brand_name || r.name,
                        logo_url: getAbsoluteMediaUrl(r.logo_url),
                        favicon_url: getAbsoluteMediaUrl(r.favicon_url),
                        theme_mode: (r as any).theme_mode || "LIGHT",
                        colors: {
                            primary: r.primary_color || "#0F172A",
                            secondary: r.secondary_color || "#3B82F6"
                        },
                        custom_domain: r.custom_domain,
                        broadcast: {
                            banner: r.broadcast_banner,
                            link: r.broadcast_link
                        },
                        support: {
                            email: r.support_email,
                            url: r.support_url,
                            whatsapp: r.support_whatsapp
                        }
                    };
                }
            } catch (e) {
                console.error("Workspace Branding Fetch Error:", e);
            }
        }

        // --- DOMAIN FALLBACK ---
        // If we didn't find a reseller link via workspace, try the hostname
        if (hostname) {
            const domainBranding = await this.getBrandingByDomain(hostname);
            if (domainBranding) {
                return {
                    ...domainBranding,
                    is_white_labeled: true
                } as any;
            }
        }

        // Return Dynamic Platform Branding from SystemConfig
        try {
            const config = await prisma.systemConfig.findUnique({
                where: { id: "global" }
            });

            return {
                is_white_labeled: false,
                brand_name: config?.platform_name || "Grafty",
                logo_url: getAbsoluteMediaUrl(config?.logo_url || "/logo.png"),
                dark_logo_url: getAbsoluteMediaUrl(config?.dark_logo_url || "/logo.png"),
                favicon_url: getAbsoluteMediaUrl(config?.favicon_url || "/favicon.ico"),
                login_logo_url: getAbsoluteMediaUrl(config?.login_logo_url || config?.logo_url || "/logo.png"),
                dashboard_logo_url: getAbsoluteMediaUrl(config?.dashboard_logo_url || config?.logo_url || "/logo.png"),
                reseller_logo_url: getAbsoluteMediaUrl(config?.reseller_logo_url || config?.logo_url || "/logo.png"),
                partner_logo_url: getAbsoluteMediaUrl(config?.partner_logo_url || config?.logo_url || "/logo.png"),
                footer_logo_url: getAbsoluteMediaUrl(config?.footer_logo_url || config?.logo_url || "/logo.png"),
                theme_mode: config?.theme_mode || "LIGHT",
                colors: {
                    primary: config?.primary_color || "#0F172A",
                    secondary: config?.secondary_color || "#3B82F6"
                },
                features: config?.features || { commerce: true, flows: true, drips: true, edu: true, api: true },
                custom_domain: null,
                broadcast: null,
                support: {
                    email: config?.support_email || "support@grafty.pro",
                    whatsapp: config?.support_whatsapp || "",
                    url: config?.support_whatsapp ? `https://wa.me/${config.support_whatsapp}` : null
                }
            };
        } catch (e) {
            console.error("System Config Branding Fetch Error (Table probably missing):", e);
            // HARD FALLBACK - NO PRISMA
            return {
                is_white_labeled: false,
                brand_name: "Grafty",
                logo_url: "/logo.png",
                dark_logo_url: "/logo.png",
                favicon_url: "/favicon.ico",
                theme_mode: "LIGHT",
                colors: { primary: "#0F172A", secondary: "#3B82F6" },
                features: { commerce: true, flows: true, drips: true, edu: true, api: true },
                support: { email: "support@grafty.pro", whatsapp: "", url: null }
            };
        }
    }

    /**
     * PHASE 3: DOMAIN RESOLVER
     * Resolves a reseller based on the hostname.
     */
    static async getBrandingByDomain(hostname: string) {
        if (!hostname) return null;
        try {
            // Normalize: strip port and trim
            const domain = hostname.split(':')[0].toLowerCase().trim();

            // 1. Priority: Direct Reseller custom_domain match
            let reseller = await prisma.reseller.findFirst({
                where: { custom_domain: domain }
            });

            // 2. Fallback: Search in PartnerDomain verify mapping
            if (!reseller) {
                const partnerDomain = await prisma.partnerDomain.findUnique({
                    where: { domain: domain },
                    include: { reseller: true }
                });

                if (partnerDomain?.reseller && partnerDomain.is_verified) {
                    reseller = partnerDomain.reseller;
                }
            }

            if (reseller) {
                return {
                    reseller_id: reseller.id,
                    brand_name: reseller.brand_name || reseller.name,
                    logo_url: getAbsoluteMediaUrl(reseller.logo_url),
                    favicon_url: getAbsoluteMediaUrl(reseller.favicon_url),
                    primary_color: reseller.primary_color || "#0F172A",
                    secondary_color: reseller.secondary_color || "#3B82F6",
                    colors: {
                        primary: reseller.primary_color || "#0F172A",
                        secondary: reseller.secondary_color || "#3B82F6"
                    },
                    broadcast: {
                        banner: reseller.broadcast_banner,
                        link: reseller.broadcast_link
                    },
                    support: {
                        email: reseller.support_email,
                        url: reseller.support_url,
                        whatsapp: reseller.support_whatsapp
                    }
                };
            }
        } catch (e) {
            console.error("Domain Branding Fetch Error:", e);
        }

        return null;
    }

    /**
     * PHASE 4: RESELLER RESOLVER
     * Fetches branding directly for a reseller by their ID.
     */
    static async getBrandingForReseller(resellerId: string) {
        if (!resellerId) return null;
        try {
            const reseller = await prisma.reseller.findUnique({
                where: { id: resellerId }
            });

            if (reseller) {
                return {
                    reseller_id: reseller.id,
                    is_white_labeled: true,
                    brand_name: reseller.brand_name || reseller.name,
                    logo_url: getAbsoluteMediaUrl(reseller.logo_url),
                    favicon_url: getAbsoluteMediaUrl(reseller.favicon_url),
                    primary_color: reseller.primary_color || "#0F172A",
                    secondary_color: reseller.secondary_color || "#3B82F6",
                    colors: {
                        primary: reseller.primary_color || "#0F172A",
                        secondary: reseller.secondary_color || "#3B82F6"
                    },
                    broadcast: {
                        banner: reseller.broadcast_banner || null,
                        link: reseller.broadcast_link || null
                    },
                    support: {
                        email: reseller.support_email || "support@" + (reseller.custom_domain || "grafty.pro"),
                        url: reseller.support_url || null,
                        whatsapp: reseller.support_whatsapp || null
                    }
                };
            }
        } catch (e) {
            console.error("Reseller Branding Fetch Error:", e);
        }
        return null;
    }
}
