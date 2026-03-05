import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { getCurrentUser } from "../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { name, trigger_keyword, nodes, edges, status } = body;

        const flow = await prisma.flow.create({
            data: {
                workspace_id: user.workspaceId,
                name: name || "Untitled Flow",
                trigger_keyword: trigger_keyword,
                nodes: nodes || [],
                edges: edges || [],
                status: status || "DRAFT",
            },
        });

        return NextResponse.json({ success: true, flow });
    } catch (error) {
        console.error("Create Flow Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const keyword = searchParams.get("keyword");

        let where: any = { workspace_id: user.workspaceId };
        if (keyword && keyword.trim() !== "") {
            where.trigger_keyword = {
                contains: keyword,
                mode: "insensitive"
            };
        }

        const flows = await prisma.flow.findMany({
            where: where,
            orderBy: { updated_at: "desc" },
        });

        return NextResponse.json({ data: flows });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
