
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding Reseller Tiers...');

    const tiers = [
        { name: "Starter", min_vendors: 0, commission_rate: 20 },
        { name: "Growth", min_vendors: 10, commission_rate: 25 },
        { name: "Empire", min_vendors: 50, commission_rate: 30 },
        { name: "Legend", min_vendors: 100, commission_rate: 35 },
    ];

    for (const tier of tiers) {
        const result = await prisma.resellerTier.upsert({
            where: { name: tier.name },
            update: {
                min_vendors: tier.min_vendors,
                commission_rate: tier.commission_rate
            },
            create: tier
        });
        console.log(`✅ Tier upserted: ${result.name} (Min: ${result.min_vendors}, Rate: ${result.commission_rate}%)`);
    }

    console.log('✨ Seeding complete.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
