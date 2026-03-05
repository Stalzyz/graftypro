
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const id = "30583a71-c618-4102-985d-c3a53639a4ad";
    console.log(`Checking Campaign ${id}...`);

    const c = await prisma.campaign.findUnique({ where: { id } });
    console.log("Current Status:", c?.status);

    console.log("Resetting to DRAFT...");
    await prisma.campaign.update({
        where: { id },
        data: { status: "DRAFT" }
    });
    console.log("Reset Complete.");
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
