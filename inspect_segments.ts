import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const WORKSPACE_ID = "89b6c788-d842-4bf6-8af9-bc02e84e76d2";

async function main() {
    const segments = await prisma.segment.findMany({
        where: { workspace_id: WORKSPACE_ID }
    });
    console.log("Existing Segments count:", segments.length);
    console.log("Existing Segments:", JSON.stringify(segments, null, 2));

    // Get all unique tags from contacts
    const contacts = await prisma.contact.findMany({
        where: { workspace_id: WORKSPACE_ID },
        select: { tags: true }
    });

    const allTags = Array.from(new Set(contacts.flatMap(c => c.tags).filter(Boolean)));
    console.log("All unique contact tags count:", allTags.length);
    console.log("All unique contact tags:", allTags);
}

main().catch(console.error).finally(() => prisma.$disconnect());
