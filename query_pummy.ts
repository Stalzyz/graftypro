import { prisma } from './lib/db';

async function main() {
    const stores = await prisma.commerceStore.findMany({
        where: {
            name: {
                contains: 'Pummy',
                mode: 'insensitive'
            }
        },
        include: {
            products: true
        }
    });
    console.log("STORES:", JSON.stringify(stores, null, 2));

    if (stores.length > 0) {
        console.log(`Found store ${stores[0].name} in workspace ${stores[0].workspace_id}`);
        console.log(`Found ${stores[0].products.length} products.`);
    } else {
        const allStores = await prisma.commerceStore.findMany();
        console.log("ALL STORES:", JSON.stringify(allStores, null, 2));
    }
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
