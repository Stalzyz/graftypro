
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { getCurrentUser } from "../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const responders = await prisma.autoResponder.findMany({
            where: { workspace_id: user.workspaceId },
            include: { flow: true },
            orderBy: { updated_at: "desc" }
        });

        return NextResponse.json({ data: responders });
    } catch (error) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { id, keyword, match_type, reply_type, reply_text, flow_id, status } = body;

        const data = {
            workspace_id: user.workspaceId,
            keyword: keyword.trim(),
            match_type: match_type || "EXACT",
            reply_type: reply_type || "TEXT",
            reply_text: reply_text,
            flow_id: flow_id,
            status: status !== undefined ? status : true
        };

        if (id) {
            const updated = await prisma.autoResponder.update({
                where: { id, workspace_id: user.workspaceId },
                data
            });
            return NextResponse.json({ success: true, data: updated });
        } else {
            const created = await prisma.autoResponder.create({
                data
            });
            return NextResponse.json({ success: true, data: created });
        }
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: "Keyword already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
