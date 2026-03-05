/**
 * Download/View Invoice
 * 
 * GET /api/invoices/[invoiceNumber]/download
 * 
 * Returns a printable HTML version of the invoice.
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from "../../../../../lib/auth";
import { InvoiceService } from "../../../../../lib/finance/invoice-service";

export const dynamic = "force-dynamic";

export async function GET(
    req: Request,
    { params }: { params: { invoiceNumber: string } }
) {
    try {
        // 1. Authenticate user
        const user = await getCurrentUser(req as any);
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { invoiceNumber } = params;

        // 2. Get Invoice
        const invoice = await InvoiceService.getInvoiceByNumber(invoiceNumber);

        if (!invoice) {
            return NextResponse.json(
                { success: false, error: 'Invoice not found' },
                { status: 404 }
            );
        }

        // 3. Verify Ownership (Security Check)
        if (invoice.workspace_id !== user.workspaceId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized access to invoice' },
                { status: 403 }
            );
        }

        // 4. Handle PDF Format
        const { searchParams } = new URL(req.url);
        const format = searchParams.get('format');

        if (format === 'pdf') {
            const pdfBuffer = await InvoiceService.generatePDF(
                invoice,
                (invoice as any).items,
                {
                    name: invoice.company_name,
                    address: invoice.company_address,
                    gstin: invoice.company_gstin,
                    state: invoice.company_state,
                    pincode: invoice.company_pincode
                }
            );

            return new NextResponse(new Uint8Array(pdfBuffer), {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename="Invoice-${invoiceNumber}.pdf"`,
                },
            });
        }

        // 5. Generate HTML
        const invoiceHtml = InvoiceService.getInvoiceHTML(invoice);

        // 6. Add Print Script to HTML
        const printableHtml = invoiceHtml.replace(
            '</body>',
            `<script>window.onload = function() { window.print(); }</script></body>`
        );

        // 7. Return HTML Response
        return new NextResponse(printableHtml, {
            headers: {
                'Content-Type': 'text/html',
            },
        });

    } catch (error: any) {
        console.error('Invoice download error:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to download invoice' },
            { status: 500 }
        );
    }
}
