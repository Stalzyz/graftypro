import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";
import { ensureSegmentsForTags } from "../../../../lib/segments/utils";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { contacts, segmentId } = await req.json();

        if (!Array.isArray(contacts)) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        let additionalTags: string[] = [];
        if (segmentId) {
            const segment = await prisma.segment.findFirst({
                where: { id: segmentId, workspace_id: user.workspaceId }
            });
            if (segment && segment.filters) {
                const filters = segment.filters as any;
                if (filters.tags && Array.isArray(filters.tags)) {
                    additionalTags = filters.tags;
                }
            }
        }

        // BATCH LIMIT (DoS Protection)
        const MAX_BATCH_SIZE = 1000;
        if (contacts.length > MAX_BATCH_SIZE) {
            return NextResponse.json({
                error: `Batch size limit exceeded. Maximum allowed: ${MAX_BATCH_SIZE}. You sent: ${contacts.length}`
            }, { status: 413 });
        }

        const stats = { created: 0, updated: 0, failed: 0 };
        const allImportedTagsSet = new Set<string>();

        const CHUNK_SIZE = 100;

        for (let i = 0; i < contacts.length; i += CHUNK_SIZE) {
            const chunk = contacts.slice(i, i + CHUNK_SIZE);

            for (const c of chunk) {
                try {
                    if (!c.phone) { stats.failed++; continue; }

                    const phone = String(c.phone).replace(/\D/g, ''); // Strip non-digits
                    if (!phone) { stats.failed++; continue; }

                    const existing = await prisma.contact.findUnique({
                        where: {
                            workspace_id_phone: {
                                workspace_id: user.workspaceId,
                                phone: phone
                            }
                        },
                        select: { tags: true }
                    });

                    const existingTags: string[] = existing?.tags || [];

                    // Sanitize incoming tags: CSV parser may give a string ("vip,lead")
                    // or an already-split array. Normalize to a clean string[].
                    const incomingTags: string[] = Array.isArray(c.tags)
                        ? c.tags.map((t: any) => String(t).trim()).filter(Boolean)
                        : typeof c.tags === "string"
                            ? c.tags.split(",").map((t: string) => t.trim()).filter(Boolean)
                            : [];

                    // BUG FIX: Merge existing + incoming + segment tags so existing
                    // tags are never wiped when re-importing an existing contact.
                    const mergedTags = Array.from(new Set([...existingTags, ...incomingTags, ...additionalTags]));

                    // Accumulate tags for auto-segment creation
                    mergedTags.forEach(t => allImportedTagsSet.add(t));

                    await prisma.contact.upsert({
                        where: {
                            workspace_id_phone: {
                                workspace_id: user.workspaceId,
                                phone: phone
                            }
                        },
                        update: {
                            name: c.name || undefined,
                            email: c.email || undefined,
                            tags: mergedTags,
                            attributes: c.attributes ? { ...(c.attributes || {}) } : undefined,
                            opt_in: true,
                        },
                        create: {
                            workspace_id: user.workspaceId,
                            phone: phone,
                            name: c.name || null,
                            email: c.email || null,
                            tags: mergedTags,
                            attributes: c.attributes || {},
                            opt_in: true,
                        },
                        select: { id: true }
                    });

                    if (existing) {
                        stats.updated++;
                    } else {
                        stats.created++;
                    }
                } catch (err) {
                    console.error("Failed to import contact:", c, err);
                    stats.failed++;
                }
            }
        }

        // Auto-create Segment records for all tags present in this import
        const importedTagsArray = Array.from(allImportedTagsSet);
        if (importedTagsArray.length > 0) {
            await ensureSegmentsForTags(user.workspaceId, importedTagsArray);
        }

        return NextResponse.json({ success: true, stats });
    } catch (error: any) {
        console.error("Bulk Import Error:", error);
        return NextResponse.json({ error: error.message || "Import failed" }, { status: 500 });
    }
}
