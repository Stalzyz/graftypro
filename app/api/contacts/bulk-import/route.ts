
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { contacts } = await req.json();

        if (!Array.isArray(contacts)) {
            return NextResponse.json({ error: "Invalid data format" }, { status: 400 });
        }

        // BATCH LIMIT (DoS Protection)
        const MAX_BATCH_SIZE = 1000;
        if (contacts.length > MAX_BATCH_SIZE) {
            return NextResponse.json({
                error: `Batch size limit exceeded. Maximum allowed: ${MAX_BATCH_SIZE}. You sent: ${contacts.length}`
            }, { status: 413 });
        }

        const stats = {
            created: 0,
            updated: 0,
            failed: 0
        };

        // Use a transaction or loop with upserts
        // Upsert by phone + workspace_id is common
        for (const c of contacts) {
            try {
                if (!c.phone) {
                    stats.failed++;
                    continue;
                }

                const phone = String(c.phone).replace(/\D/g, ''); // Clean phone

                // Check if exists
                const existing = await prisma.contact.findFirst({
                    where: {
                        workspace_id: user.workspaceId,
                        phone: phone
                    }
                });

                if (existing) {
                    await prisma.contact.update({
                        where: { id: existing.id },
                        data: {
                            name: c.name || existing.name,
                            email: c.email || existing.email,
                            tags: Array.from(new Set([...existing.tags, ...(Array.isArray(c.tags) ? c.tags : [])])),
                            attributes: { ...(existing.attributes as object), ...(c.attributes || {}) }
                        }
                    });
                    stats.updated++;
                } else {
                    await prisma.contact.create({
                        data: {
                            workspace_id: user.workspaceId,
                            phone: phone,
                            name: c.name || null,
                            email: c.email || null,
                            tags: Array.isArray(c.tags) ? c.tags : [],
                            attributes: c.attributes || {}
                        }
                    });
                    stats.created++;
                }
            } catch (err) {
                console.error("Failed to import contact:", c, err);
                stats.failed++;
            }
        }

        return NextResponse.json({ success: true, stats });
    } catch (error: any) {
        console.error("Bulk Import Error:", error);
        return NextResponse.json({ error: error.message || "Import failed" }, { status: 500 });
    }
}
