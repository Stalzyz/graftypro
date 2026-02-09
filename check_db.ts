
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const admins = await (prisma as any).adminUser.findMany();
    console.log('Admins found:', admins.length);
    admins.forEach((a: any) => {
        console.log(`- ID: ${a.id}, Email: ${a.email}, Role: ${a.role}`);
    });

    const users = await prisma.user.findMany({ take: 5 });
    console.log('Recent Users:', users.length);
    users.forEach((u: any) => {
        console.log(`- User ID: ${u.id}, Email: ${u.email}, Workspace: ${u.workspace_id}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
