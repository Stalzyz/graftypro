import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const ws = await prisma.workspace.findFirst();
    if (!ws) {
        console.log("No workspace found");
        return;
    }
    console.log("Found workspace", ws.id, ws.name);
    try {
        const res = await prisma.workspace.update({
            where: { id: ws.id },
            data: { plan: "PRO", current_plan_id: null }
        });
        console.log("Updated", res);
    } catch(e) {
        console.error("Error", e);
    }
}
main().finally(() => prisma.$disconnect());
