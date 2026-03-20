
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getResellerSession } from "@/lib/reseller/auth-helper";

export async function POST(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { kyc_type, signature, agreement_version, documents } = body;

        if (!signature) {
            return NextResponse.json({ error: "Digital signature is required" }, { status: 400 });
        }

        // Update Reseller with KYC and Signature metadata
        const updated = await prisma.reseller.update({
            where: { id: session.userId },
            data: {
                kyc_type: kyc_type,
                kyc_status: "SUBMITTED", // Moves from NONE to SUBMITTED
                kyc_submitted_at: new Date(),
                // Use kyc_data JSON field to store agreement metadata
                kyc_data: {
                    signature: signature,
                    signed_at: new Date().toISOString(),
                    agreement_version: agreement_version,
                    documents: documents || [],
                    ip_address: req.headers.get("x-forwarded-for") || "unknown",
                    user_agent: req.headers.get("user-agent") || "unknown"
                }
            }
        });

        return NextResponse.json({ 
            success: true, 
            message: "Agreement Signed & Onboarding Initiated",
            data: updated 
        });

    } catch (error: any) {
        console.error("Agreement Submission Error:", error);
        return NextResponse.json({ error: "Failed to process agreement" }, { status: 500 });
    }
}
