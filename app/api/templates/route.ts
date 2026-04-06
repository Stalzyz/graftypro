
import { NextResponse } from "next/server";
import { prisma } from "../../../lib/db";
import { getCurrentUser } from "../../../lib/auth";
import { MetaTemplateService } from "../../../lib/whatsapp/templates";
import { decrypt } from "../../../lib/security/encryption";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const templates = await prisma.template.findMany({
            where: { workspace_id: user.workspaceId },
            orderBy: { updated_at: 'desc' },
            include: { variables: true }
        });

        return NextResponse.json({ data: templates });
    } catch (error) {
        return NextResponse.json({ error: "Error fetching templates" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        let body: any = {};
        try {
            body = await req.json();
        } catch (e) {
            // No body = likely a sync request from the Campaign page
            body = { sync: true };
        }

        const { name, category, language, sync } = body;

        // ---------------------------------------------------------
        // CASE 1: Sync from Meta
        // ---------------------------------------------------------
        if (sync) {
            const waba = await prisma.whatsAppAccount.findUnique({
                where: { workspace_id: user.workspaceId }
            });

            if (!waba || !waba.waba_id || !waba.access_token) {
                return NextResponse.json({ error: "WABA not connected" }, { status: 400 });
            }

            const token = decrypt(waba.access_token);
            const metaTemplates = await MetaTemplateService.listTemplates(waba.waba_id, token);

            // Upsert each template
            for (const mt of metaTemplates) {
                await prisma.template.upsert({
                    where: {
                        workspace_id_name_language: {
                            workspace_id: user.workspaceId,
                            name: mt.name,
                            language: mt.language
                        }
                    },
                    update: {
                        status: mt.status as any,
                        category: mt.category as any,
                        components: mt.components as any,
                        meta_id: mt.id
                    },
                    create: {
                        workspace_id: user.workspaceId,
                        name: mt.name,
                        language: mt.language,
                        category: mt.category as any,
                        status: mt.status as any,
                        components: mt.components as any,
                        meta_id: mt.id
                    }
                });
            }

            return NextResponse.json({ success: true, count: metaTemplates.length });
        }

        // ---------------------------------------------------------
        // CASE 2: Create Draft
        // ---------------------------------------------------------
        if (!name || !category || !language) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Strict Meta compliant formatting: lowercase, a-z, 0-9, and underscores ONLY
        const apiName = name.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

        const existing = await prisma.template.findFirst({
            where: {
                workspace_id: user.workspaceId,
                name: apiName,
                language: language
            }
        });

        if (existing) {
            return NextResponse.json({ error: "Template with this name/language already exists" }, { status: 409 });
        }

        const template = await prisma.template.create({
            data: {
                workspace_id: user.workspaceId,
                name: apiName,
                language,
                category,
                status: "DRAFT",
                components: [],
            }
        });

        return NextResponse.json({ data: template });

    } catch (error: any) {
        console.error("Template Action Error", error);
        return NextResponse.json({ error: error.message || "Error processing request" }, { status: 500 });
    }
}
