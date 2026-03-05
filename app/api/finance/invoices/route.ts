import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth";
import { InvoiceService } from "../../../../lib/finance/invoice-service";
import { prisma } from "../../../../lib/db";

export async function POST(req: NextRequest) {
    const user = await getCurrentUser(req);

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!["OWNER", "ADMIN", "FINANCE"].includes(user.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await req.json();
        const {
            items,
            billingDetails,
            paymentMethod = "Manual",
            paymentId = `MANUAL-${Date.now()}`,
            status = "PAID",
            notes
        } = body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: "Items are required" }, { status: 400 });
        }

        if (!billingDetails || !billingDetails.name) {
            return NextResponse.json({ error: "Billing details are required" }, { status: 400 });
        }

        const invoice = await InvoiceService.createInvoice({
            workspaceId: user.workspaceId,
            items,
            billingDetails,
            paymentMethod,
            paymentId,
            status,
            notes
        });

        return NextResponse.json(invoice);
    } catch (error: any) {
        console.error("Manual Invoice Creation Failed:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    const user = await getCurrentUser(req);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    const where: any = {
        workspace_id: user.workspaceId
    };

    if (search) {
        where.OR = [
            { invoice_number: { contains: search, mode: 'insensitive' } },
            { billing_name: { contains: search, mode: 'insensitive' } },
            { billing_email: { contains: search, mode: 'insensitive' } }
        ];
    }

    try {
        const [invoices, total] = await Promise.all([
            prisma.invoice.findMany({
                where,
                skip,
                take: limit,
                orderBy: { created_at: 'desc' },
                include: { items: true }
            }),
            prisma.invoice.count({ where })
        ]);

        return NextResponse.json({
            data: invoices,
            pagination: {
                total,
                page,
                limit,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
