
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/admin-auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const partner = await prisma.partner.findUnique({
            where: { id: params.id },
            include: {
                referred_workspaces: {
                    select: {
                        id: true,
                        name: true,
                        plan: true,
                        status: true,
                        created_at: true
                    }
                },
                payouts: {
                    orderBy: { requested_at: "desc" },
                    take: 10
                }
            }
        });

        if (!partner) return NextResponse.json({ error: "Not Found" }, { status: 404 });

        return NextResponse.json({ partner });

    } catch (e) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await getAdminSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { status, commission_pct } = body;

        const updated = await prisma.partner.update({
            where: { id: params.id },
            data: {
                ...(status && { status }),
                ...(commission_pct && { commission_pct: parseFloat(commission_pct) })
            }
        });

        return NextResponse.json({ success: true, partner: updated });

    } catch (e) {
        return NextResponse.json({ error: "Update Failed" }, { status: 500 });
    }
}
