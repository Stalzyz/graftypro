import { prisma } from './lib/db';

async function main() {
    const flows = await prisma.flow.findMany({
        where: { workspace_id: '3b04fc39' }
    });
    console.log("FLOWS:", JSON.stringify(flows, null, 2));

    const products = await prisma.product.findMany({
        where: { workspace_id: '3b04fc39' }
    });
    console.log("PRODUCTS:", JSON.stringify(products, null, 2));
}
main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
