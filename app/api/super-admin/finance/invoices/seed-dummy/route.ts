
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { InvoiceService } from "@/lib/finance/invoice-service";
import { getAdminSession } from "@/lib/admin-auth";

export async function POST(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session || session.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const workspace = await prisma.workspace.findFirst({
            select: { id: true }
        });

        if (!workspace) {
            return NextResponse.json({ error: "No workspace found. Please create a vendor first." }, { status: 400 });
        }

        const invoice = await InvoiceService.createInvoice({
            workspaceId: workspace.id,
            billingDetails: {
                name: "Acme International (Dummy Client)",
                address: "456 Corporate Park, Mumbai, Maharashtra",
                state: "Maharashtra",
                pincode: "400018",
                gstin: "27AAAAA0000A1Z5"
            },
            items: [
                {
                    description: "Grafty Enterprise Cloud - Annual License",
                    hsn_code: "998311",
                    quantity: 1,
                    rate: 85000,
                    taxable_value: 85000
                },
                {
                    description: "Premium Support & Implementation",
                    hsn_code: "998311",
                    quantity: 1,
                    rate: 15000,
                    taxable_value: 15000
                }
            ],
            paymentMethod: "RAZORPAY",
            status: "PAID"
        });

        return NextResponse.json({
            success: true,
            invoice_number: invoice.invoice_number,
            preview_url: `/api/super-admin/finance/invoices/${encodeURIComponent(invoice.invoice_number)}/preview`,
            pdf_url: `/api/super-admin/finance/invoices/${encodeURIComponent(invoice.invoice_number)}/pdf`
        });

    } catch (error: any) {
        console.error("Seed Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
