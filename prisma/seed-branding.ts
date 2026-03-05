import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🚀 Seeding High-Ticket Reseller Demo...');

    // 1. Create or Find Reseller Tier
    const eliteTier = await prisma.resellerTier.upsert({
        where: { name: 'Elite' },
        update: {},
        create: {
            name: 'Elite',
            markup_percentage: 15, // 15% profit margin
            min_vendors: 0,
            features: { white_label: true, custom_domain: true, priority_support: true }
        }
    });

    // 2. Create a Branded Reseller
    const reseller = await prisma.reseller.upsert({
        where: { email: 'partner@bluesky.com' },
        update: {},
        create: {
            name: 'BlueSky Automation',
            email: 'partner@bluesky.com',
            password_hash: 'demo-hash', // Use real hash in production
            brand_name: 'BlueSky WhatsApp Portal',
            logo_url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', // Blue Avatar Logo
            primary_color: '#2563EB', // Blue 600
            secondary_color: '#60A5FA', // Blue 400
            custom_domain: 'dashboard.bluesky.com',
            referral_code: 'BSKY2026',
            status: 'ACTIVE',
            wallet_balance: 5000.00,
            tier_id: eliteTier.id
        }
    });

    // 3. Create a Vendor Workspace linked to this Reseller
    const workspace = await prisma.workspace.create({
        data: {
            name: 'BlueSky Test Vendor',
            business_name: 'BlueSky Coffee Co.',
            status: 'ACTIVE',
            plan: 'ENTERPRISE',
            reseller_id: reseller.id
        }
    });

    // 4. Record Initial Credit
    await prisma.resellerLedger.create({
        data: {
            reseller_id: reseller.id,
            amount: 5000.00,
            type: 'CREDIT',
            description: 'System-seeded testing credits',
            balance_after: 5000.00
        }
    });

    console.log('✅ Seeding Complete!');
    console.log(`
  Demo Credentials:
  - Reseller: BlueSky Automation
  - Brand: ${reseller.brand_name}
  - Primary Color: ${reseller.primary_color}
  - Workspace ID: ${workspace.id}
  `);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
