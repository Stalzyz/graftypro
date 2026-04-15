
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { requireSuperAdmin } from "../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await requireSuperAdmin();
        
        // Query both tables and merge (Legacy + New CRM leads)
        const [crmLeads, toolLeads] = await Promise.all([
            prisma.lead.findMany({
                orderBy: { created_at: 'desc' },
                take: 500
            }),
            prisma.publicToolLead.findMany({
                orderBy: { created_at: 'desc' },
                take: 500
            })
        ]);

        // Normalize both into a unified shape for the UI
        const normalizedCrm = crmLeads.map(l => ({
            id: l.id,
            phone: l.whatsapp_number,
            tool_type: l.source || 'CRM',
            name: l.name,
            email: l.email,
            goal: l.goal,
            metadata: { goal: l.goal, business: l.business_name },
            created_at: l.created_at
        }));

        const normalizedTool = toolLeads.map(l => ({
            id: l.id,
            phone: l.phone,
            tool_type: l.tool_type,
            name: null,
            email: null,
            goal: null,
            metadata: l.metadata,
            created_at: l.created_at
        }));

        // Merge and sort by date
        const allLeads = [...normalizedCrm, ...normalizedTool]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 500);

        return NextResponse.json({ success: true, leads: allLeads });
    } catch (error: any) {
        console.error("[SuperAdmin Leads] Error:", error.message);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
