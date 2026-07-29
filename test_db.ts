import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
    const ws = await prisma.workspace.findFirst({ where: { name: { contains: 'Grekam' } } });
    if (!ws) return console.log("No grekam workspace");
    console.log("Workspace ID:", ws.id);
    const campaigns = await prisma.campaign.findMany({
        where: { workspace_id: ws.id },
        orderBy: { created_at: 'desc' },
        take: 3,
        include: { stats: true }
    });
    console.log(JSON.stringify(campaigns, null, 2));
}
run().then(() => prisma.$disconnect());
