
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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

        const formattedInvoices = invoices.map(inv => ({
            ...inv,
            total_amount: Number(inv.total_amount || 0),
            net_amount: Number(inv.net_amount || 0),
            gst_amount: Number(inv.gst_amount || 0)
        }));

        return NextResponse.json({ success: true, data: formattedInvoices });
    } catch (error: any) {
        console.error("Reseller Invoices GET Error:", error);
        return NextResponse.json({ error: "Failed to load invoices" }, { status: 500 });
    }
}
