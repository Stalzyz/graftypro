import { prisma } from "../lib/db";

async function main() {
    console.log("Updating existing products with stock 0 to 100...");
    const updatedProducts = await prisma.commerceProduct.updateMany({
        where: { stock: 0 },
        data: { stock: 100 }
    });
    console.log(`Updated ${updatedProducts.count} commerce products.`);

    const updatedVariants = await prisma.commerceProductVariant.updateMany({
        where: { stock: 0 },
        data: { stock: 100 }
    });
    console.log(`Updated ${updatedVariants.count} product variants.`);
}

main()
    .catch((e) => {
        console.error("Stock Fix Error:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
