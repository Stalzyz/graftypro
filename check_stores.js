const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    const stores = await prisma.commerceStore.findMany({
        select: { id: true, name: true, catalog_id: true, workspace_id: true }
    });
    console.log(JSON.stringify(stores, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
