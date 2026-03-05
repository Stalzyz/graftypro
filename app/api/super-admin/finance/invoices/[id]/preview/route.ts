
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { InvoiceService } from "@/lib/finance/invoice-service";

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getAdminSession();
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const invoice = await InvoiceService.getInvoiceByNumber(decodeURIComponent(params.id));
        if (!invoice) {
            return new NextResponse("Invoice not found", { status: 404 });
        }

        const html = InvoiceService.getInvoiceHTML(invoice);

        return new NextResponse(html, {
            headers: {
                "Content-Type": "text/html"
            }
        });

    } catch (error: any) {
        console.error("Preview Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
