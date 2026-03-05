import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import { getCurrentUser } from "../../../../../../lib/auth";
import { InvoiceService } from "../../../../../../lib/finance/invoice-service";

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const payload = await getCurrentUser(req);
        if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { id } = params;

        // 1. Fetch Invoice with items
        const invoice = await prisma.invoice.findUnique({
            where: { id },
            include: {
                items: true,
                workspace: true
            }
        });

        if (!invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });

        // 2. Authorization Check
        const isSuperAdmin = payload.role === "SUPER_ADMIN" || payload.role === "ADMIN";
        const isOwner = invoice.workspace_id === payload.workspaceId;

        let isReseller = false;
        if (payload.role === "RESELLER") {
            const workspace = await prisma.workspace.findUnique({
                where: { id: invoice.workspace_id }
            });
            if (workspace?.reseller_id === payload.userId) {
                isReseller = true;
            }
        }

        if (!isSuperAdmin && !isOwner && !isReseller) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        // 3. Generate PDF
        let sellerDetails: any = {
            company_name: invoice.company_name,
            company_address: invoice.company_address,
            company_gstin: invoice.company_gstin,
            company_state: invoice.company_state,
            company_pincode: invoice.company_pincode
        };

        const pdfBuffer = await InvoiceService.generatePDF(invoice, invoice.items, sellerDetails);

        // 4. Return as PDF (Convert Buffer to Uint8Array for Response)
        return new NextResponse(new Uint8Array(pdfBuffer), {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="Invoice-${invoice.invoice_number}.pdf"`,
                "Cache-Control": "no-cache"
            }
        });

    } catch (error: any) {
        console.error("PDF Gen Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
