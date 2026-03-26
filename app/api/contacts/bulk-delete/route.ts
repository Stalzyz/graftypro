import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { ids } = body;

        if (!Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: "No contact IDs provided" }, { status: 400 });
        }

        const res = await prisma.contact.deleteMany({
            where: {
                id: { in: ids },
                workspace_id: user.workspaceId,
            },
        });

        return NextResponse.json({ success: true, count: res.count });
    } catch (error: any) {
        console.error("Bulk Delete Contacts Error", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
