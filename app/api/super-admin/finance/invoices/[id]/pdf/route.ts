
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { InvoiceService } from "@/lib/finance/invoice-service";
import { SystemConfigService } from "@/lib/services/system-config-service";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const invoice = await InvoiceService.getInvoiceByNumber(decodeURIComponent(params.id));
        if (!invoice) {
            return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
        }

        // Fetch seller details (System or Reseller) to pass to PDF generator
        // This logic mimics createInvoice but purely for regeneration
        let sellerDetails = {
            name: "Grafty Academy",
            address: "",
            gstin: "",
            state: "Karnataka",
            pincode: "",
            logoUrl: "",
            signatureUrl: "", // Add signature if available
            bankDetails: null as any
        };

        const config = await SystemConfigService.getConfig();
        sellerDetails = {
            name: config.company_name,
            address: config.company_address || "",
            gstin: config.company_gstin || "",
            state: config.company_state || "Karnataka",
            pincode: config.company_pincode || "",
            logoUrl: config.logo_url || "",
            signatureUrl: (config.invoice_config as any)?.signature_url || "",
            bankDetails: config.company_bank_details
        };

        // If reseller invoice, logic would be more complex (fetching reseller), skipping for MVP system invoices

        const pdfBuffer = await InvoiceService.generatePDF(invoice, invoice.items, sellerDetails);

        return new NextResponse(pdfBuffer as any, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `attachment; filename="${invoice.invoice_number}.pdf"`
            }
        });

    } catch (error: any) {
        console.error("PDF Download Error:", error);
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
