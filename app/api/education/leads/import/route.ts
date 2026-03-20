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

        let successCount = 0;
        let skipCount = 0;

        for (const row of rows) {
            try {
                // Determine names - check various common headers
                const studentName = row.student_name || row.name || row.full_name || row.student || "Imported Student";
                const phone = row.whatsapp_number || row.phone || row.mobile || row.contact;
                
                if (!phone) {
                    skipCount++;
                    continue;
                }

                // Clean phone number
                const cleanedPhone = String(phone).replace(/\D/g, '');

                await prisma.eduLead.create({
                    data: {
                        workspace_id: user.workspaceId,
                        student_name: studentName,
                        parent_name: row.parent_name || row.parent || null,
                        whatsapp_number: cleanedPhone,
                        email: row.email || null,
                        grade: row.grade || row.class || null,
                        course_interested: row.course_interested || row.course || null,
                        city: row.city || null,
                        potential_revenue: parseFloat(row.potential_revenue || row.revenue || row.value || 0),
                        lead_source: row.source || "CSV_IMPORT",
                        status: "NEW",
                        activities: {
                            create: {
                                type: "STATUS_CHANGE",
                                content: "Lead imported via CSV",
                                new_status: "NEW"
                            }
                        }
                    }
                });
                successCount++;
            } catch (err) {
                console.error("Edu Import Row Error:", err);
                skipCount++;
            }
        }

        return NextResponse.json({
            success: true,
            count: successCount,
            skipped: skipCount
        });

    } catch (error: any) {
        console.error("Critical Edu Import Crash:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
