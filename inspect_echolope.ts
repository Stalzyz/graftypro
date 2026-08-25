import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const WORKSPACE_ID = "89b6c788-d842-4bf6-8af9-bc02e84e76d2";

async function main() {
    const contact = await prisma.contact.findFirst({
        where: { workspace_id: WORKSPACE_ID, phone: { contains: "7895501900" } }
    });
    console.log("Echolope contact record:", contact);
}

main().catch(console.error).finally(() => prisma.$disconnect());
