import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import axios from "axios";

// GET /api/templates
export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const templates = await prisma.template.findMany({
            where: { workspace_id: user.workspaceId },
            orderBy: { updated_at: "desc" },
        });

        return NextResponse.json({ data: templates });
    } catch (error) {
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// POST /api/templates/sync - Sync from Meta
export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 1. Get WABA Creds
        const waba = await prisma.whatsAppAccount.findUnique({
            where: { workspace_id: user.workspaceId }
        });

        if (!waba) {
            return NextResponse.json({ error: "No WhatsApp Account Connected" }, { status: 400 });
        }

        // 2. Fetch from Meta
        const fields = "name,status,category,language,components";
        const url = `https://graph.facebook.com/v18.0/${waba.waba_id}/message_templates?fields=${fields}&limit=100`;

        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${waba.access_token}` }
        });

        const metaTemplates = response.data.data;
        const synced = [];

        // 3. Upsert to DB
        for (const t of metaTemplates) {
            const local = await prisma.template.upsert({
                where: {
                    workspace_id_name_language: {
                        workspace_id: user.workspaceId,
                        name: t.name,
                        language: t.language
                    }
                },
                update: {
                    status: t.status,
                    category: t.category,
                    components: t.components,
                    updated_at: new Date()
                },
                create: {
                    workspace_id: user.workspaceId,
                    waba_id: waba.id,
                    name: t.name,
                    language: t.language,
                    category: t.category,
                    status: t.status,
                    components: t.components
                }
            });
            synced.push(local);
        }

        return NextResponse.json({ success: true, count: synced.length });

    } catch (error: any) {
        console.error("Template Sync Error:", error.response?.data || error);
        return NextResponse.json(
            { error: "Failed to sync templates" },
            { status: 500 }
        );
    }
}
