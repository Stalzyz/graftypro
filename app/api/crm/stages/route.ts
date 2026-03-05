import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const stages = await prisma.universalCrmStage.findMany({
            where: { workspace_id: user.workspaceId },
            orderBy: { order: "asc" }
        });

        // Seed default stages if none exist
        if (stages.length === 0) {
            const defaults = [
                { name: 'New Lead', color: '#94a3b8', order: 0 },
                { name: 'Contacted', color: '#3b82f6', order: 1 },
                { name: 'Interested', color: '#8b5cf6', order: 2 },
                { name: 'Negotiation', color: '#f59e0b', order: 3 },
                { name: 'Closed Won', color: '#10b981', order: 4 },
                { name: 'Closed Lost', color: '#f43f5e', order: 5 },
            ];

            await prisma.universalCrmStage.createMany({
                data: defaults.map(d => ({ ...d, workspace_id: user.workspaceId }))
            });

            return NextResponse.json(await prisma.universalCrmStage.findMany({
                where: { workspace_id: user.workspaceId },
                orderBy: { order: "asc" }
            }));
        }

        return NextResponse.json(stages);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();

        const stage = await prisma.universalCrmStage.create({
            data: {
                workspace_id: user.workspaceId,
                name: body.name,
                color: body.color || '#94a3b8',
                order: body.order || 0
            }
        });

        return NextResponse.json(stage);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
