import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const WORKSPACE_ID = "89b6c788-d842-4bf6-8af9-bc02e84e76d2";

async function main() {
    // Fetch all unique tags from contacts in workspace
    const contacts = await prisma.contact.findMany({
        where: { workspace_id: WORKSPACE_ID, NOT: { tags: { equals: [] } } },
        select: { tags: true }
    });

    const allContactTags = Array.from(new Set(contacts.flatMap(c => c.tags).filter(Boolean)));
    console.log("Unique contact tags in workspace 89b6c788:", allContactTags);

    const existingSegments = await prisma.segment.findMany({
        where: { workspace_id: WORKSPACE_ID }
    });
    const existingNamesLower = new Set(existingSegments.map(s => s.name.toLowerCase()));

    for (const tag of allContactTags) {
        if (!existingNamesLower.has(tag.toLowerCase())) {
            const seg = await prisma.segment.create({
                data: {
                    workspace_id: WORKSPACE_ID,
                    name: tag,
                    description: `Auto-created segment for tag "${tag}"`,
                    filters: { tags: [tag] }
                }
            });
            console.log(`Auto-created segment: "${seg.name}" (${seg.id})`);
        } else {
            console.log(`Segment for tag "${tag}" already exists.`);
        }
    }

    const updatedSegments = await prisma.segment.findMany({
        where: { workspace_id: WORKSPACE_ID }
    });
    console.log("\nAll segments now in workspace 89b6c788:");
    updatedSegments.forEach(s => console.log(` - ${s.name} (id: ${s.id}, filters: ${JSON.stringify(s.filters)})`));
}

main().catch(console.error).finally(() => prisma.$disconnect());
