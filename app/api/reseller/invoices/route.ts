import { NextResponse } from "next/server";
import { BillingService } from "@/lib/billing/service";

/**
 * PHASE B: RESELLER INVOICE API
 * List billing history for the reseller.
 */
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const resellerId = searchParams.get('resellerId');

        if (!resellerId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const invoices = await BillingService.getInvoices(resellerId);
        return NextResponse.json({ success: true, data: invoices });
    } catch (error: any) {
        return NextResponse.json({ error: "Failed to load invoices" }, { status: 500 });
    }
}

/**
 * MOCK TOP-UP (For testing Option B UI)
 */
export async function POST(req: Request) {
    try {
        const { resellerId, amount } = await req.json();
        const invoice = await BillingService.processTopUp(resellerId, amount);
        return NextResponse.json({ success: true, data: invoice });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
