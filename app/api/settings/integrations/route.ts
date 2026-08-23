import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user || !user.workspaceId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { type, credentials } = await req.json();

        if (!type || !credentials) {
            return NextResponse.json({ error: "Missing required fields: type and credentials" }, { status: 400 });
        }

        console.log(`[IntegrationsAPI] Saving integration ${type} for workspace ${user.workspaceId}...`);

        let integrationData = null;

        // 1. Try saving to Integration table directly
        try {
            integrationData = await prisma.integration.upsert({
                where: {
                    workspace_id_type: {
                        workspace_id: user.workspaceId,
                        type: type as any,
                    }
                },
                update: {
                    credentials: credentials,
                    is_active: true
                },
                create: {
                    workspace_id: user.workspaceId,
                    type: type as any,
                    credentials: credentials,
                    is_active: true
                }
            });
        } catch (dbErr: any) {
            console.warn(`[IntegrationsAPI] Database enum notice for ${type}: ${dbErr.message}. Storing in Workspace Settings fallback...`);
        }

        // 2. Always sync to Workspace Settings JSON for high reliability
        const workspace = await prisma.workspace.findUnique({ where: { id: user.workspaceId } });
        const settings = (workspace?.settings as any) || {};
        settings.integrations = settings.integrations || {};
        settings.integrations[type] = {
            credentials,
            is_active: true,
            updated_at: new Date().toISOString()
        };

        await prisma.workspace.update({
            where: { id: user.workspaceId },
            data: { settings }
        });

        console.log(`[IntegrationsAPI] Successfully saved ${type} integration!`);

        return NextResponse.json({
            success: true,
            data: integrationData || { type, credentials, is_active: true }
        });

    } catch (error: any) {
        console.error("[IntegrationsAPI] Exception:", error);
        return NextResponse.json({ error: error.message || "Error saving integration" }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user || !user.workspaceId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const integrations = await prisma.integration.findMany({
            where: { workspace_id: user.workspaceId }
        });

        const workspace = await prisma.workspace.findUnique({ where: { id: user.workspaceId } });
        const settingsIntegrations = (workspace?.settings as any)?.integrations || {};

        const combinedList = [...integrations];

        // Merge workspace JSON settings integrations
        Object.entries(settingsIntegrations).forEach(([type, item]: [string, any]) => {
            if (!combinedList.some(i => i.type === type)) {
                combinedList.push({
                    id: `setting_${type}`,
                    workspace_id: user.workspaceId,
                    type,
                    credentials: item.credentials,
                    is_active: item.is_active ?? true,
                    created_at: new Date(),
                    updated_at: new Date(),
                } as any);
            }
        });

        return NextResponse.json({ data: combinedList });
    } catch (error: any) {
        console.error("[IntegrationsAPI] GET Error:", error);
        return NextResponse.json({ error: "Error fetching integrations" }, { status: 500 });
    }
}
