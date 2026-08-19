import { prisma } from "@/lib/db";

/**
 * Ensures that a Segment record exists for every tag in the provided tags array.
 * If a tag does not already match an existing segment name or segment filter tag,
 * a new Segment with filters: { tags: [tag] } is automatically created.
 */
export async function ensureSegmentsForTags(workspaceId: string, tags: string[]) {
    if (!workspaceId || !tags || tags.length === 0) return;

    // Normalize & filter non-empty unique tag strings
    const cleanTags = Array.from(
        new Set(tags.map(t => String(t).trim()).filter(Boolean))
    );
    if (cleanTags.length === 0) return;

    try {
        // Fetch existing segments for this workspace
        const existingSegments = await prisma.segment.findMany({
            where: { workspace_id: workspaceId },
            select: { id: true, name: true, filters: true }
        });

        const existingNamesLower = new Set(existingSegments.map(s => s.name.toLowerCase()));

        // Check if any existing segment filters already include the tag
        const existingFilterTagsLower = new Set<string>();
        existingSegments.forEach(s => {
            if (s.filters && typeof s.filters === "object") {
                const f = s.filters as any;
                if (Array.isArray(f.tags)) {
                    f.tags.forEach((t: any) => existingFilterTagsLower.add(String(t).toLowerCase()));
                }
            }
        });

        const tagsToCreate: string[] = [];
        for (const tag of cleanTags) {
            const tagLower = tag.toLowerCase();
            if (!existingNamesLower.has(tagLower) && !existingFilterTagsLower.has(tagLower)) {
                tagsToCreate.push(tag);
                existingNamesLower.add(tagLower);
                existingFilterTagsLower.add(tagLower);
            }
        }

        if (tagsToCreate.length > 0) {
            for (const tag of tagsToCreate) {
                await prisma.segment.create({
                    data: {
                        workspace_id: workspaceId,
                        name: tag,
                        description: `Auto-created segment for tag "${tag}"`,
                        filters: { tags: [tag] }
                    }
                }).catch(err => {
                    console.error(`[ensureSegmentsForTags] Failed to create segment for tag "${tag}":`, err?.message);
                });
            }
        }
    } catch (err) {
        console.error("[ensureSegmentsForTags] Error syncing segments for tags:", err);
    }
}
