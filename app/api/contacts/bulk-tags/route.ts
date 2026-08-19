import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";
import { ensureSegmentsForTags } from "../../../../lib/segments/utils";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { ids, tags } = body;

        if (!Array.isArray(ids) || ids.length === 0 || !Array.isArray(tags)) {
            return NextResponse.json({ error: "Invalid data provided" }, { status: 400 });
        }

        let updatedCount = 0;
        for (const id of ids) {
            const contact = await prisma.contact.findFirst({
                where: { id: id, workspace_id: user.workspaceId }
            });

            if (contact) {
                const combinedTags = Array.from(new Set([...contact.tags, ...tags]));
                await prisma.contact.updateMany({
                    where: { id: contact.id },
                    data: { tags: combinedTags }
                });
                updatedCount++;
            }
        }

        if (tags.length > 0) {
            await ensureSegmentsForTags(user.workspaceId, tags);
        }

        return NextResponse.json({ success: true, count: updatedCount });
    } catch (error: any) {
        console.error("Bulk Add Tags Error", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
