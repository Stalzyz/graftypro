import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { getCurrentUser } from "../../../lib/auth";
import { ensureSegmentsForTags } from "../../../lib/segments/utils";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Auto-ensure Segment entries exist for all unique contact tags in this workspace
        const contactsWithTags = await prisma.contact.findMany({
            where: {
                workspace_id: user.workspaceId,
                NOT: { tags: { equals: [] } }
            },
            select: { tags: true }
        });

        const allContactTags = Array.from(
            new Set(contactsWithTags.flatMap(c => c.tags).filter(Boolean))
        );

        if (allContactTags.length > 0) {
            await ensureSegmentsForTags(user.workspaceId, allContactTags);
        }

        const segments = await prisma.segment.findMany({
            where: { workspace_id: user.workspaceId },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json({ data: segments });
    } catch (error) {
        console.error("GET Segments Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { name, description, filters } = await req.json();

        if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

        const segment = await prisma.segment.create({
            data: {
                workspace_id: user.workspaceId,
                name,
                description,
                filters: filters || {}
            }
        });

        return NextResponse.json({ data: segment });
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
