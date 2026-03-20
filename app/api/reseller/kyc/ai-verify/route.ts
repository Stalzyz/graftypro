
import { NextResponse } from "next/server";
import { getResellerSession } from "@/lib/reseller/auth-helper";
import { KycService } from "@/lib/reseller/kyc-service";

export async function POST(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { fileUrl, type } = body;

        if (!fileUrl) {
            return NextResponse.json({ error: "No document provided for analysis" }, { status: 400 });
        }

        // Invoke the AI Verification Service
        const result = await KycService.verifyDocument(fileUrl, type || 'OTHER');

        if (result.success) {
            return NextResponse.json({
                success: true,
                score: result.score,
                extracted: result.extracted_data,
                message: "AI Document Analysis Complete: Verified Valid."
            });
        } else {
            return NextResponse.json({
                success: false,
                reason: result.reason,
                message: "AI Analysis Refused: Document appears irrelevant or invalid."
            }, { status: 422 });
        }

    } catch (error: any) {
        console.error("AI KYC Error:", error);
        return NextResponse.json({ error: "Internal AI Engine Failure" }, { status: 500 });
    }
}
