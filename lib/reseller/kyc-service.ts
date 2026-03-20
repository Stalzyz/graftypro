
import { prisma } from "@/lib/db";
import { AIService } from "../ai/openai";

/**
 * Enterprise KYC Verification Service.
 * Integrated with OpenAI Vision for high-fidelity document analysis.
 */
export class KycService {
    /**
     * Performs a deep AI vision scan on uploaded identity documents.
     */
    static async verifyDocument(fileUrl: string, type: 'PAN' | 'AADHAR' | 'GST' | 'OTHER'): Promise<{ 
        success: boolean; 
        score: number; 
        reason?: string;
        extracted_data?: any;
    }> {
        try {
            if (!fileUrl) return { success: false, score: 0, reason: "NULL_ASSET_REFERENCE" };

            // 1. Identify Document Class
            let documentClass = "National ID";
            if (type === 'PAN') documentClass = "Indian PAN Card";
            if (type === 'AADHAR') documentClass = "Indian Aadhar Card";
            if (type === 'GST') documentClass = "Indian GST Registration Certificate";

            // 2. Invoke the vision engine
            const result = await AIService.verifyKycDocument(fileUrl, documentClass);
            
            return {
                success: result.success,
                score: result.score,
                reason: result.reason,
                extracted_data: result.extracted_data
            };

        } catch (error: any) {
            return { success: false, score: 0, reason: "SCAN_ENGINE_FAULT: " + error.message };
        }
    }

    /**
     * Updates the reseller's KYC lifecycle state.
     */
    static async updateLifecycle(resellerId: string, status: 'SUBMITTED' | 'VERIFIED' | 'REJECTED', notes?: string) {
        return await prisma.reseller.update({
            where: { id: resellerId },
            data: {
                kyc_status: status,
                kyc_notes: notes,
                kyc_verified_at: status === 'VERIFIED' ? new Date() : undefined
            }
        });
    }
}
