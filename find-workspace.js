const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const workspace = await prisma.workspace.findFirst();
    console.log('WORKSPACE_ID:', workspace ? workspace.id : 'NONE');
    process.exit(0);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});
