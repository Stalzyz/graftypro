import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    const workspaces = await prisma.workspace.findMany({
        select: { id: true, name: true }
    });
    console.log("Workspaces:", workspaces);

    for (const ws of workspaces) {
        const count = await prisma.contact.count({ where: { workspace_id: ws.id } });
        const echolope = await prisma.contact.findFirst({
            where: { workspace_id: ws.id, phone: { contains: "7895501900" } }
        });
        const allTags = Array.from(new Set(
            (await prisma.contact.findMany({ where: { workspace_id: ws.id }, select: { tags: true } })).flatMap(c => c.tags)
        ));
        console.log(`WS: ${ws.name} (${ws.id}) -> Contacts: ${count} | Echolope: ${!!echolope} | Unique Tags:`, allTags);
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
