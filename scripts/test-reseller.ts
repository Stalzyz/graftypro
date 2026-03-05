
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function testReseller() {
    console.log("Testing Reseller Model...");
    try {
        console.log("Prisma keys:", Object.keys(prisma).filter(k => !k.startsWith("_")));
        // @ts-ignore
        const count = await prisma.reseller.count();
        console.log("Reseller count:", count);
    } catch (e: any) {
        console.error("Reseller test failed:", e.message);
    }
}

testReseller().catch(console.error).finally(() => prisma.$disconnect());
