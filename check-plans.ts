import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.subscriptionPlan.findMany().then(res => {
    console.log(res.map(p => ({ id: p.id, name: p.name })));
}).finally(() => prisma.$disconnect());
