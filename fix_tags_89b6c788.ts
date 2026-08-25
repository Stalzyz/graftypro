/**
 * Tag Separation Migration
 * 
 * Fixes contacts in workspace 89b6c788 where tags were stored as a single
 * comma-separated string inside the array (e.g. ["vip,lead"] instead of ["vip","lead"]).
 * 
 * Run with: npx tsx fix_tags_89b6c788.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const WORKSPACE_ID = "89b6c788-d842-4bf6-8af9-bc02e84e76d2";

async function main() {
    console.log(`[TagFix] Scanning contacts in workspace ${WORKSPACE_ID}...`);

    // Fetch ALL contacts that have at least one tag
    const contacts = await prisma.contact.findMany({
        where: {
            workspace_id: WORKSPACE_ID,
            NOT: { tags: { equals: [] } }
        },
        select: { id: true, name: true, tags: true }
    });

    console.log(`[TagFix] Found ${contacts.length} contacts with tags.`);

    // Find contacts where any tag element contains a comma → malformed
    const malformed = contacts.filter(c => c.tags.some(t => t.includes(",")));
    console.log(`[TagFix] ${malformed.length} contact(s) have comma-in-tag (malformed).`);

    if (malformed.length === 0) {
        // Also show a sample of current tags for verification
        console.log("\n[TagFix] Sample of contacts with tags:");
        contacts.slice(0, 10).forEach(c =>
            console.log(`  - ${c.name || "unnamed"} | tags: ${JSON.stringify(c.tags)}`)
        );
        console.log("\n[TagFix] No malformed tags found — all tags are already correctly separated.");
        return;
    }

    console.log("\n[TagFix] Sample malformed entries:");
    malformed.slice(0, 5).forEach(c =>
        console.log(`  - ${c.name || "unnamed"} | ${JSON.stringify(c.tags)}`)
    );

    // Fix each malformed contact
    let fixed = 0;
    let failed = 0;

    for (const contact of malformed) {
        try {
            // Split any comma-containing tag into multiple individual tags
            const fixedTags = Array.from(new Set(
                contact.tags.flatMap(t =>
                    t.includes(",")
                        ? t.split(",").map(s => s.trim()).filter(Boolean)
                        : [t.trim()]
                ).filter(Boolean)
            ));

            await prisma.contact.update({
                where: { id: contact.id },
                data: { tags: { set: fixedTags } }
            });

            console.log(`  ✅ Fixed: ${contact.name || "unnamed"} | ${JSON.stringify(contact.tags)} → ${JSON.stringify(fixedTags)}`);
            fixed++;
        } catch (err: any) {
            console.error(`  ❌ Failed to fix contact ${contact.id}:`, err.message);
            failed++;
        }
    }

    console.log(`\n[TagFix] Complete. Fixed: ${fixed} | Failed: ${failed}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
