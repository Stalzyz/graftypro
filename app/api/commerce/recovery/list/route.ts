import { NextResponse } from "next/server";
import { getCurrentUser } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/db";
import { WhatsAppService } from "../../../../../lib/whatsapp/service";
import { decrypt } from "../../../../../lib/security/encryption";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Fetch orders that are PLACED but not PAID within 1 hour, and not COD
        const ONE_HOUR_AGO = new Date(Date.now() - 60 * 60 * 1000);
        const recoveries = await prisma.commerceOrder.findMany({
            where: {
                store: { workspace_id: user.workspaceId },
                status: "PLACED",
                payment_status: "PENDING",
                payment_method: { not: "COD" },
                created_at: { lt: ONE_HOUR_AGO }
            },
            include: {
                contact: {
                    select: { name: true, phone: true }
                }
            },
            orderBy: { created_at: "desc" },
            take: 20
        });

        return NextResponse.json({
            success: true,
            recoveries: recoveries.map(r => ({
                id: r.id,
                customer: r.contact?.name || r.contact?.phone || "Unknown",
                phone: r.contact?.phone,
                amount: `₹${Number(r.total_amount).toLocaleString()}`,
                time: r.created_at,
                orderNumber: r.order_number
            }))
        });

    } catch (error: any) {
        console.error("Recovery List Error:", error);
        return NextResponse.json({ error: "Failed to fetch recoveries" }, { status: 500 });
    }
}
