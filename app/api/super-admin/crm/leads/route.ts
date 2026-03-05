
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getAdminSession } from "../../../../../lib/admin-auth";
import { CRMService } from "../../../../../lib/services/crm-service";

export async function GET(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const stage = searchParams.get("stage");
        const type = searchParams.get("type");

        const filters: any = {};
        if (stage) filters.stage = stage;
        if (type) filters.type = type;

        const leads = await CRMService.getLeads(filters);
        return NextResponse.json(leads);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const lead = await CRMService.captureLead(body);
        return NextResponse.json(lead);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { id, stage, ...rest } = body;

        if (stage) {
            const updated = await CRMService.updateStage(id, stage, session.id);
            return NextResponse.json(updated);
        }

        const updated = await prisma.cRMLead.update({
            where: { id },
            data: rest
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
