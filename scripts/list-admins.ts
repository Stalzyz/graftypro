
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    try {
        // @ts-ignore
        const admins = await prisma.adminUser.findMany();
        console.log("Admins:", admins.map(a => ({ email: a.email, role: a.role })));
    } catch (e: any) {
        console.error("Failed to list admins:", e.message);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
