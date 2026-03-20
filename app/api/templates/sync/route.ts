
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";
import { TemplateCategory } from "@prisma/client";
import { decrypt } from "../../../../lib/security/encryption";

export const dynamic = "force-dynamic";

const API_VER = "v20.0";

/**
 * PHASE 9: Template Sync from Meta
 * Fetches all approved templates from Meta and syncs them to local DB
 */

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get WABA credentials
        const waba = await prisma.whatsAppAccount.findUnique({
            where: { workspace_id: user.workspaceId }
        });

        if (!waba || !waba.access_token || !waba.waba_id) {
            return NextResponse.json({ error: "WhatsApp not connected" }, { status: 400 });
        }

        // Fetch templates using the Service (which has mock bypass)
        const { MetaTemplateService } = await import("@/lib/whatsapp/templates");
        const token = decrypt(waba.access_token);
        const metaTemplates = await MetaTemplateService.listTemplates(waba.waba_id, token);

        console.log(`Found ${metaTemplates.length} templates from Meta`);

        let synced = 0;
        let skipped = 0;

        for (const mt of metaTemplates) {
            // Map Meta category to our enum
            const category = mapCategory(mt.category);

            // Build components JSON
            const components = mt.components || [];

            // Upsert template
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
                    category,
                    components,
                    meta_id: mt.id
                },
                create: {
                    workspace_id: user.workspaceId,
                    name: mt.name,
                    language: mt.language,
                    category,
                    status: mt.status as any,
                    components,
                    meta_id: mt.id
                }
            });

            synced++;
        }

        return NextResponse.json({
            success: true,
            synced,
            skipped,
            total: metaTemplates.length
        });

    } catch (e: any) {
        console.error("Template Sync Error:", e.response?.data || e.message);
        return NextResponse.json({
            error: e.response?.data?.error?.message || "Sync Failed"
        }, { status: 500 });
    }
}

function mapCategory(metaCategory: string): TemplateCategory {
    const mapping: Record<string, TemplateCategory> = {
        "MARKETING": "MARKETING",
        "UTILITY": "UTILITY",
        "AUTHENTICATION": "AUTHENTICATION",
        "SERVICE": "UTILITY"
    };
    return mapping[metaCategory] || "UTILITY";
}
