
import { prisma } from "./db";

export async function getLandingPage(slug: string) {
    const p = prisma as any;
    if (!p.landingPage) {
        console.error("CRITICAL: prisma.landingPage is undefined in lib/cms.ts");
        return null;
    }

    try {
        const page = await p.landingPage.findUnique({
            where: { slug },
            include: {
                sections: {
                    where: { is_active: true },
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!page) return null;

        // If published, we might want to return the published_data snapshot instead
        // to ensure "Nuclear-level stability" even if sections are being edited.
        if (page.status === 'PUBLISHED' && page.published_data) {
            return page.published_data;
        }

        return page;
    } catch (e) {
        console.error(`CMS Error fetching page ${slug}:`, e);
        return null;
    }
}

export async function publishLandingPage(id: string) {
    const p = prisma as any;
    if (!p.landingPage) throw new Error("Database Schema Mismatch: LandingPage model missing");

    const page = await p.landingPage.findUnique({
        where: { id },
        include: {
            sections: {
                where: { is_active: true },
                orderBy: { order: 'asc' }
            }
        }
    });

    if (!page) throw new Error("Page not found");

    // Create version snapshot
    const versionCount = await p.landingVersion.count({ where: { page_id: id } });

    const snapshot = {
        id: page.id,
        slug: page.slug,
        title: page.title,
        seo_config: page.seo_config,
        banner_config: page.banner_config,
        custom_css: page.custom_css,
        sections: page.sections.map((s: any) => ({
            id: s.id,
            type: s.type,
            content: s.content,
            style_config: s.style_config,
            order: s.order
        })),
        published_at: new Date().toISOString()
    };

    await p.$transaction([
        p.landingVersion.create({
            data: {
                page_id: id,
                version_number: versionCount + 1,
                snapshot: snapshot as any
            }
        }),
        p.landingPage.update({
            where: { id },
            data: {
                status: 'PUBLISHED',
                published_data: snapshot as any
            }
        })
    ]);

    return snapshot;
}
