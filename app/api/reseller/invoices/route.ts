
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const resellerId = req.headers.get("x-reseller-id");
        if (!resellerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const invoices = await prisma.invoice.findMany({
            where: { reseller_id: resellerId },
            include: {
                workspace: {
                    select: {
                        name: true,
                        business_name: true
                    }
                }
            },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json({ success: true, data: invoices });
    } catch (error: any) {
        console.error("Reseller Invoices GET Error:", error);
        return NextResponse.json({ error: "Failed to load invoices" }, { status: 500 });
    }
}
