
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Seeding Landing Page CMS...");

    const home = await prisma.landingPage.upsert({
        where: { slug: 'home' },
        update: {},
        create: {
            title: 'Home Page',
            slug: 'home',
            status: 'PUBLISHED',
            seo_config: {
                title: "Grafty | Enterprise WhatsApp Business Platform",
                description: "Scale your business on WhatsApp with automated flows, drips, and commerce.",
                keywords: "whatsapp api, bsp, automation, crm, bulk message, chatgpt whatsapp",
                og_image: "https://grafty.pro/og-image.png"
            }
        }
    });

    console.log(`✅ Home Page ensured (ID: ${home.id})`);

    // Define initial sections
    const sections = [
        {
            type: 'HERO',
            order: 1,
            content: {
                title: "Scale Your Business on <span class='text-gradient'>WhatsApp.</span>",
                subtitle: "Grafty is a goal-driven WhatsApp Business Platform that helps you generate leads, collect payments, and scale revenue — without manual effort.",
                primaryBtnText: "Start Free Trial",
                primaryBtnLink: "/register",
                secondaryBtnText: "View Solutions",
                secondaryBtnLink: "/solutions"
            }
        },
        {
            type: 'INTEGRATIONS',
            order: 2,
            content: {
                title: "Connects with the Apps You Love",
                subtitle: "Full API support for custom CRM orchestration."
            }
        },
        {
            type: 'FEATURES',
            order: 3,
            content: {
                title: "What Grafty <span class='text-gradient'>Actually Does.</span>",
                subtitle: "Most businesses use WhatsApp manually. Grafty turns WhatsApp into a scalable sales engine."
            }
        },
        {
            type: 'MODULES',
            order: 4,
            content: {}
        },
        {
            type: 'PRICING',
            order: 5,
            content: {
                title: "Pricing. <span class='text-gradient'>API Connected.</span>",
                subtitle: "No hidden charges. Credits visible. Billing transparent."
            }
        }
    ];

    // Delete old sections and recreate
    await prisma.landingSection.deleteMany({ where: { page_id: home.id } });

    for (const s of sections) {
        await prisma.landingSection.create({
            data: {
                page_id: home.id,
                type: s.type,
                content: s.content,
                order: s.order
            }
        });
    }

    // Publish it
    const pageWithSections = await prisma.landingPage.findUnique({
        where: { id: home.id },
        include: { sections: { orderBy: { order: 'asc' } } }
    });

    const snapshot = {
        ...home,
        sections: pageWithSections?.sections,
        published_at: new Date().toISOString()
    };

    await prisma.landingPage.update({
        where: { id: home.id },
        data: {
            published_data: snapshot as any
        }
    });

    console.log("✅ CMS Seeding Complete.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
