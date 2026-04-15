
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const config = await prisma.systemConfig.findFirst();
    console.log(JSON.stringify(config?.landing_page_config, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
