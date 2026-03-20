import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getResellerSession } from "@/lib/reseller/auth-helper";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const leads = await prisma.resellerLead.findMany({
            where: { reseller_id: session.userId },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json({ success: true, data: leads });
    } catch (error) {
        return NextResponse.json({ error: "Failed to load leads" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { business_name, contact_name, email, phone, notes, status } = await req.json();

        if (!business_name) {
            return NextResponse.json({ error: "Business name is required" }, { status: 400 });
        }

        const lead = await prisma.resellerLead.create({
            data: {
                reseller_id: session.userId,
                business_name,
                contact_name: contact_name || null,
                email: email || null,
                phone: phone || null,
                notes: notes || null,
                status: status || "NEW"
            }
        });

        return NextResponse.json({ success: true, data: lead });
    } catch (error) {
        return NextResponse.json({ error: "Failed to create lead" }, { status: 500 });
    }
}
