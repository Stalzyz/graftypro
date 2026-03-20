
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getResellerSession } from "@/lib/reseller/auth-helper";

export async function POST(request: Request) {
    try {
        const session = await getResellerSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { kyc_type, id_number, id_type, documents, business_reg_number } = body;

        if (!kyc_type || !documents || documents.length === 0) {
            return NextResponse.json({ error: "Please upload your proof document" }, { status: 400 });
        }

        const reseller = await prisma.reseller.update({
            where: { id: session.userId },
            data: {
                kyc_status: "SUBMITTED",
                kyc_type,
                kyc_data: {
                    id_type: id_type || 'UPLOADED_PROOF',
                    id_number: id_number || 'N/A',
                    documents: documents || [],
                    business_reg_number
                },
                kyc_submitted_at: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: "KYC details submitted successfully. Our team will review them shortly.",
            data: reseller
        });

    } catch (error: any) {
        console.error("KYC Submission Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
