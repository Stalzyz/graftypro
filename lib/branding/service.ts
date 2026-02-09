import { prisma } from "@/lib/db";

export class BrandingService {
    /**
     * PHASE 1: BRAND RESOLVER
     * Finds the correct branding for a given workspace.
     * If workspace is linked to a reseller, return reseller branding.
     * Else, return default platform (Wabot) branding.
     */
    static async getBrandingForWorkspace(workspaceId: string) {
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

        // Return Dynamic Platform Branding from SystemConfig
        const config = await prisma.systemConfig.findUnique({
            where: { id: "global" }
        });

        return {
            is_white_labeled: false,
            brand_name: config?.platform_name || "WAVO",
            logo_url: config?.logo_url || null,
            favicon_url: config?.favicon_url || "/favicon.ico",
            colors: {
                primary: config?.primary_color || "#27954D",
                secondary: config?.secondary_color || "#042F94"
            },
            custom_domain: null,
            broadcast: null,
            support: config?.support_email ? {
                email: config.support_email,
                url: config.support_whatsapp ? `https://wa.me/${config.support_whatsapp}` : null
            } : null
        };
    }

    /**
     * PHASE 3: DOMAIN RESOLVER
     * Resolves a reseller based on the hostname.
     */
    static async getBrandingByDomain(hostname: string) {
        const reseller = await prisma.reseller.findUnique({
            where: { custom_domain: hostname }
        });

        if (reseller) {
            return {
                reseller_id: reseller.id,
                brand_name: reseller.brand_name || reseller.name,
                logo_url: reseller.logo_url,
                favicon_url: reseller.favicon_url,
                colors: {
                    primary: reseller.primary_color,
                    secondary: reseller.secondary_color
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

        return null;
    }
}
