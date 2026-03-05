import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import { EduService } from "../../../../../../lib/edu/service";
import { getServerSession } from "next-auth/next"; // Adjust if using custom auth

export const dynamic = "force-dynamic";

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        // Simple auth check (using session or token)
        const leadId = params.id;

        // Find Lead to get workspace_id
        const lead = await prisma.eduLead.findUnique({
            where: { id: leadId }
        });

        if (!lead) {
            return NextResponse.json({ error: "Lead not found" }, { status: 404 });
        }

        const link = await EduService.generateAdmissionPaymentLink(lead.workspace_id, leadId);

        return NextResponse.json({
            success: true,
            url: link.short_url,
            message: "Payment link generated successfully"
        });

    } catch (error: any) {
        console.error("Payment Link Generation Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to generate payment link" },
            { status: 500 }
        );
    }
}
