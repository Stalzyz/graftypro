
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getAdminSession, AdminSession } from "../../../../../lib/admin-auth";
import { CRMService } from "../../../../../lib/services/crm-service";

/**
 * SUPER ADMIN CRM LEADS API
 * Handles prospecting data for the internal sales war room.
 */

export async function GET(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session || !['SUPER_ADMIN', 'SALES'].includes(session.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const stage = searchParams.get("stage");
        const type = searchParams.get("type");

        const filters: any = {};
        if (stage) filters.stage = stage;
        if (type) filters.type = type;

        const leads = await CRMService.getLeads(filters);
        return NextResponse.json(leads);
    } catch (error: any) {
        console.error("CRM Leads GET Error:", error);
        return NextResponse.json({ error: "Failed to fetch CRM leads" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session || !['SUPER_ADMIN', 'SALES'].includes(session.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        
        // Validation: Required fields for lead capture
        if (!body.name || !body.email) {
            return NextResponse.json({ error: "Name and Email are mandatory for lead capture" }, { status: 400 });
        }

        const lead = await CRMService.captureLead(body);
        return NextResponse.json(lead);
    } catch (error: any) {
        console.error("CRM Leads POST Error:", error);
        return NextResponse.json({ error: error.message || "Lead capture failure" }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session || !['SUPER_ADMIN', 'SALES'].includes(session.role)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { id, stage, ...rest } = body;

        if (!id) {
            return NextResponse.json({ error: "Lead identity (id) is required for updates" }, { status: 400 });
        }

        let updated;
        if (stage) {
            // Prioritize service-based stage transition (includes activities and automation)
            updated = await CRMService.updateStage(id, stage, session.id);
        } else {
            // General record update
            updated = await prisma.cRMLead.update({
                where: { id },
                data: {
                    ...rest,
                    updated_at: new Date()
                }
            });
        }

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error("CRM Leads PATCH Error:", error);
        return NextResponse.json({ error: error.message || "Failed to update lead" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session || session.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: "Only Super Admins can purge leads" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) return NextResponse.json({ error: "Missing lead ID" }, { status: 400 });

        await prisma.cRMLead.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
    }
}
