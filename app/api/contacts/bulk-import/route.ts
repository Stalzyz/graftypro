import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

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

        // Bug #3 Fix: CSV-imported contacts must also be opted-in, otherwise broadcasts
        // find 0 recipients. The worker filter is: { opt_in: true, blocked: false }.
        //
        // Performance fix: replaced N sequential findFirst+update/create calls with
        // chunked upserts — far faster for large imports.
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

                    const result = await prisma.contact.upsert({
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
                            // Bug #3 Fix: also opt-in existing contacts on re-import
                            opt_in: true,
                        },
                        create: {
                            workspace_id: user.workspaceId,
                            phone: phone,
                            name: c.name || null,
                            email: c.email || null,
                            tags: mergedTags,
                            attributes: c.attributes || {},
                            opt_in: true, // Bug #3 Fix: imported contacts must be opted-in
                        },
                        select: { id: true }
                    });

                    // Accurate tracking: existing contact = update, new contact = create
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

        // Note: stats.created and stats.updated are now tracked accurately above.

        return NextResponse.json({ success: true, stats });
    } catch (error: any) {
        console.error("Bulk Import Error:", error);
        return NextResponse.json({ error: error.message || "Import failed" }, { status: 500 });
    }
}
