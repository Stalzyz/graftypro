import { prisma } from "../db";

export class BrandingService {
    /**
     * PHASE 1: BRAND RESOLVER
     * Finds the correct branding for a given workspace.
     * If workspace is linked to a reseller, return reseller branding.
     * Else, return default platform (Grafty) branding.
     */
    static async getBrandingForWorkspace(workspaceId?: string) {
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
                        logo_url: r.logo_url || "/logo-placeholder.png",
                        favicon_url: r.favicon_url || "/favicon.ico",
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
                            url: r.support_url
                        }
                    };
                }
            } catch (e) {
                console.error("Workspace Branding Fetch Error:", e);
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
                logo_url: config?.logo_url || "/grafty.svg",
                dark_logo_url: config?.dark_logo_url || "/grafty.svg",
                favicon_url: config?.favicon_url || "/grafty_fav.svg",
                login_logo_url: config?.login_logo_url || config?.logo_url || "/grafty.svg",
                dashboard_logo_url: config?.dashboard_logo_url || config?.logo_url || "/grafty.svg",
                reseller_logo_url: config?.reseller_logo_url || config?.logo_url || "/grafty.svg",
                partner_logo_url: config?.partner_logo_url || config?.logo_url || "/grafty.svg",
                footer_logo_url: config?.footer_logo_url || config?.logo_url || "/grafty.svg",
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
                logo_url: "/grafty.svg",
                dark_logo_url: "/grafty.svg",
                favicon_url: "/grafty_fav.svg",
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
                    logo_url: reseller.logo_url,
                    favicon_url: reseller.favicon_url,
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
                        url: reseller.support_url
                    }
                };
            }
        } catch (e) {
            console.error("Domain Branding Fetch Error:", e);
        }

        return null;
    }
}
