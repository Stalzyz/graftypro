import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";
import Papa from "papaparse";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const csvText = await file.text();
        const results = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true
        });

        const rows = results.data as any[];
        if (rows.length === 0) {
            return NextResponse.json({ error: "CSV file is empty" }, { status: 400 });
        }

        // Fetch existing stages to map by name
        const stages = await prisma.universalCrmStage.findMany({
            where: { workspace_id: user.workspaceId }
        });

        let successCount = 0;
        let skipCount = 0;

        // Atomic processing for bulk insert
        for (const row of rows) {
            try {
                // Find stage by name or use default
                const stage = stages.find(s =>
                    s.name.toLowerCase() === (row.stage_name || row.stage || "").toLowerCase()
                );

                // Check/Create Contact
                let contactId = null;
                if (row.phone) {
                    let contact = await prisma.contact.findUnique({
                        where: { workspace_id_phone: { workspace_id: user.workspaceId, phone: String(row.phone) } }
                    });
                    if (!contact) {
                        contact = await prisma.contact.create({
                            data: {
                                workspace_id: user.workspaceId,
                                phone: String(row.phone),
                                name: row.name || "Unknown Lead",
                                email: row.email || null
                            }
                        });
                    }
                    contactId = contact.id;
                }

                await prisma.universalCrmLead.create({
                    data: {
                        workspace_id: user.workspaceId,
                        name: row.name || "Imported Lead",
                        phone: row.phone ? String(row.phone) : null,
                        email: row.email || null,
                        deal_value: parseFloat(row.deal_value || row.value || 0),
                        source: row.source || "IMPORT",
                        stage_id: stage?.id || null,
                        contact_id: contactId,
                        custom_data: row // Store raw row as backup
                    }
                });
                successCount++;
            } catch (err) {
                console.error("Import Row Error:", err);
                skipCount++;
            }
        }

        return NextResponse.json({
            success: true,
            count: successCount,
            skipped: skipCount
        });

    } catch (error: any) {
        console.error("Critical Import Crash:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
