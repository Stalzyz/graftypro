
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin-auth";
import { SystemConfigService } from "@/lib/services/system-config-service";

export async function POST(req: Request) {
    try {
        const session = await getAdminSession();
        if (!session || session.role !== "SUPER_ADMIN") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { tax_config } = body;

        if (!tax_config) {
            return NextResponse.json({ error: "Missing tax_config" }, { status: 400 });
        }

        const cleanConfig = {
            gst_rate: (Number(tax_config.cgst_rate) + Number(tax_config.sgst_rate)) / 100 || 0.18,
            cgst_rate: Number(tax_config.cgst_rate) / 100 || 0.09,
            sgst_rate: Number(tax_config.sgst_rate) / 100 || 0.09,
            igst_rate: Number(tax_config.igst_rate) / 100 || 0.18,
            hsn_code: tax_config.hsn_code || "998311"
        };

        const updated = await SystemConfigService.updateConfig({
            tax_config: cleanConfig
        });

        return NextResponse.json({ success: true, config: updated });
    } catch (error: any) {
        console.error("Update Tax Config Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
