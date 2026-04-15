
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Prisma Client Keys:", Object.keys(prisma));

    // Also check for 'creditPricing' specifically
    // @ts-ignore
    console.log("prisma.creditPricing:", prisma.creditPricing);
    // @ts-ignore
    console.log("prisma.pricing:", prisma.pricing);
    // @ts-ignore
    console.log("prisma.credit_pricing:", prisma.credit_pricing);

    // Check internal dmmf
    // @ts-ignore
    if (prisma._dmmf) {
        // @ts-ignore
        console.log("Models in DMMF:", prisma._dmmf.datamodel.models.map((m: any) => m.name));
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
