import { prisma } from '../lib/db';

async function checkGrekamWorkspace() {
    const ws = await prisma.workspace.findUnique({
        where: { id: '89b6c788-d842-4bf6-8af9-bc02e84e76d2' },
        include: {
            plan_details: true
        }
    });

    console.log('--- Grekam Workspace Details ---');
    console.log(JSON.stringify(ws, null, 2));
}

checkGrekamWorkspace()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
    });
