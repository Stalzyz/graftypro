import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";
import { Parser } from "json2csv";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return new Response("Unauthorized", { status: 401 });

        const leads = await prisma.universalCrmLead.findMany({
            where: { workspace_id: user.workspaceId },
            include: { stage: true }
        });

        if (leads.length === 0) {
            return NextResponse.json({ error: "No leads to export" }, { status: 400 });
        }

        const data = leads.map(l => ({
            id: l.id,
            name: l.name,
            phone: l.phone,
            email: l.email,
            deal_value: l.deal_value || 0,
            status: l.status,
            source: l.source,
            stage: l.stage?.name || "No Stage",
            created_at: l.created_at.toISOString()
        }));

        const json2csvParser = new Parser();
        const csv = json2csvParser.parse(data);

        return new Response(csv, {
            headers: {
                "Content-Type": "text/csv",
                "Content-Disposition": `attachment; filename="crm_leads_export_${new Date().toISOString()}.csv"`
            }
        });

    } catch (error: any) {
        console.error("Export Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
