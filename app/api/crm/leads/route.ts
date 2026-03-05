import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const url = new URL(req.url);
        const stageId = url.searchParams.get('stage_id');
        const search = url.searchParams.get('search');

        const whereClause: any = { workspace_id: user.workspaceId };

        if (stageId) whereClause.stage_id = stageId;
        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search } }
            ];
        }

        const leads = await prisma.universalCrmLead.findMany({
            where: whereClause,
            include: { stage: true, user: true, contact: true },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json(leads);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();

        // Check if contact exists or create one (optional but recommended for WhatsApp link)
        let contactId = body.contact_id;
        if (!contactId && body.phone) {
            let contact = await prisma.contact.findUnique({
                where: { workspace_id_phone: { workspace_id: user.workspaceId, phone: body.phone } }
            });
            if (!contact) {
                contact = await prisma.contact.create({
                    data: {
                        workspace_id: user.workspaceId,
                        phone: body.phone,
                        name: body.name,
                        email: body.email
                    }
                });
            }
            contactId = contact.id;
        }

        const lead = await prisma.universalCrmLead.create({
            data: {
                workspace_id: user.workspaceId,
                name: body.name,
                phone: body.phone || null,
                email: body.email || null,
                source: body.source || null,
                status: body.status || 'NEW',
                deal_value: body.deal_value || 0.00,
                stage_id: body.stage_id || null,
                assigned_to: body.assigned_to || null,
                custom_data: body.custom_data || {},
                contact_id: contactId || null
            },
            include: { stage: true }
        });

        // Log Activity
        await prisma.universalCrmActivity.create({
            data: {
                workspace_id: user.workspaceId,
                lead_id: lead.id,
                user_id: user.id || null,
                type: 'CREATED',
                notes: 'Lead created in CRM'
            }
        });

        return NextResponse.json(lead);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
