
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { type, credentials } = await req.json();

        if (!type || !credentials) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const integration = await prisma.integration.upsert({
            where: {
                workspace_id_type: {
                    workspace_id: user.workspaceId,
                    type: type,
                }
            },
            update: {
                credentials: credentials,
                is_active: true
            },
            create: {
                workspace_id: user.workspaceId,
                type: type,
                credentials: credentials,
                is_active: true
            }
        });

        return NextResponse.json({ success: true, data: integration });

    } catch (error) {
        console.error("Integration Save Error", error);
        return NextResponse.json({ error: "Error saving integration" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const integrations = await prisma.integration.findMany({
            where: { workspace_id: user.workspaceId }
        });

        return NextResponse.json({ data: integrations });
    } catch (error) {
        return NextResponse.json({ error: "Error fetching integrations" }, { status: 500 });
    }
}
