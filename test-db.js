const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.whatsAppAccount.findFirst().then(res => console.log("DB connection successful, WABA:", res ? res.waba_id : "None")).catch(console.error).finally(() => prisma.$disconnect());
