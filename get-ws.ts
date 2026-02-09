import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const workspace = await prisma.workspace.findFirst();
        if (workspace) {
            console.log('WORKSPACE_ID=' + workspace.id);
        } else {
            console.log('NO_WORKSPACE_FOUND');
        }
    } catch (e) {
        console.error('ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
