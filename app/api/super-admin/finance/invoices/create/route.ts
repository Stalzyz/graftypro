
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { InvoiceService } from "@/lib/finance/invoice-service";

export async function POST(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session || session.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();

        // Basic validation
        if (!body.billing_name || !body.items || body.items.length === 0) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const invoice = await InvoiceService.createInvoice({
            workspaceId: body.workspace_id || "system", // default to system if not provided
            billingDetails: {
                name: body.billing_name,
                address: body.billing_address || "",
                state: body.billing_state || "",
                pincode: body.billing_pincode || "",
                gstin: body.billing_gstin,
                email: body.billing_email
            },
            items: body.items,
            paymentMethod: body.payment_method || "MANUAL",
            status: "PAID",
            paymentId: body.transaction_id
        });

        return NextResponse.json({ success: true, invoice });
    } catch (error: any) {
        console.error("Manual Invoice Creation Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
