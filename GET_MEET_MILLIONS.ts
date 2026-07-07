import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
    const w = await prisma.workspace.findFirst({ where: { name: { contains: "Meet Millions" } } });
    console.log(w);
}
run();
