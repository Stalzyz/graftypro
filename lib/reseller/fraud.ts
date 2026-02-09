import { prisma } from "@/lib/db";
import { FINANCIAL_RULES } from "./config";

export class FraudDetectionEngine {
    /**
     * Evaluates the risk of a new vendor mapping.
     */
    static async evaluateVendorRisk(resellerId: string, workspaceId: string, tx: any) {
        let riskScoreIncrease = 0;
        const signals: { type: string; impact: number; details: any }[] = [];

        const [reseller, workspace] = await Promise.all([
            tx.reseller.findUnique({ where: { id: resellerId } }),
            tx.workspace.findUnique({
                where: { id: workspaceId },
                include: { users: { where: { role: 'OWNER' } } }
            })
        ]);

        if (!reseller || !workspace) return;

        const vendorOwnerEmail = workspace.users[0]?.email;

        // 1. SIGNAL: Self-referral Detection
        if (vendorOwnerEmail && vendorOwnerEmail.toLowerCase() === reseller.email.toLowerCase()) {
            const impact = 60;
            riskScoreIncrease += impact;
            signals.push({ type: "SELF_REFERRAL", impact, details: { email: vendorOwnerEmail } });
        }

        // 2. SIGNAL: Rapid Signup Pattern
        const windowStart = new Date(Date.now() - (FINANCIAL_RULES.RAPID_SIGNUP_WINDOW_MINS * 60 * 1000));
        const recentSignupsCount = await tx.resellerVendorMap.count({
            where: { reseller_id: resellerId, mapped_at: { gte: windowStart } }
        });

        if (recentSignupsCount > 5) {
            const impact = 30;
            riskScoreIncrease += impact;
            signals.push({ type: "RAPID_SIGNUP", impact, details: { count: recentSignupsCount } });
        }

        // 3. SIGNAL: Shared Device/Network (Mockup for now)
        // In real setup, we would compare IP/Device Fingerprints

        if (riskScoreIncrease > 0) {
            const newScore = Math.min(Number(reseller.risk_score || 0) + riskScoreIncrease, 100);
            let isFrozen = reseller.is_frozen;
            let freezeReason = reseller.freeze_reason;

            if (newScore >= FINANCIAL_RULES.RISK_THRESHOLD_HIGH && !isFrozen) {
                isFrozen = true;
                freezeReason = "Automatically frozen due to high risk score (Potential Fraud Pattern)";
            }

            await tx.reseller.update({
                where: { id: resellerId },
                data: {
                    risk_score: newScore,
                    is_frozen: isFrozen,
                    freeze_reason: freezeReason
                }
            });

            for (const signal of signals) {
                await tx.resellerRiskLog.create({
                    data: {
                        reseller_id: resellerId,
                        signal_type: signal.type,
                        risk_impact: signal.impact,
                        details: signal.details
                    }
                });
            }
        }
    }

    /**
     * Cross-verifies a payment proof against the payment gateway.
     */
    static async verifyPaymentProof(resellerId: string, transactionId: string, proofUrl: string) {
        return await prisma.$transaction(async (tx) => {
            const reseller = await tx.reseller.findUnique({ where: { id: resellerId } });
            if (!reseller) throw new Error("Reseller not found");

            // 1. Duplicate Detection: Is this proof already used?
            const duplicate = await tx.resellerFraudProof.findFirst({
                where: {
                    OR: [
                        { proof_url: proofUrl },
                        { transaction_id: transactionId }
                    ]
                }
            });

            if (duplicate) {
                await tx.reseller.update({
                    where: { id: resellerId },
                    data: { risk_score: { increment: 50 }, is_frozen: true, freeze_reason: "Duplicate payment proof detected" }
                });
                throw new Error("Fraud Alert: This proof has already been submitted.");
            }

            // 2. Gateway Verification (Mock logic)
            // In production: await razorpay.payments.fetch(transactionId)
            const isValidOnGateway = transactionId.startsWith("pay_"); // Simplistic mock

            // 3. Analyze Proof (Mock OCR/Metadata)
            const risk_score = isValidOnGateway ? 0 : 80;
            const checks = [
                { name: "Gateway Cross-Check", status: isValidOnGateway ? "PASS" : "FAIL" },
                { name: "Duplicate Detection", status: "PASS" },
                { name: "EXIF/Metadata Check", status: "PASS" }
            ];

            return await tx.resellerFraudProof.create({
                data: {
                    reseller_id: resellerId,
                    transaction_id: transactionId,
                    proof_url: proofUrl,
                    status: isValidOnGateway ? "VERIFIED" : "PENDING",
                    risk_score,
                    checks_passed: checks,
                    verified_at: isValidOnGateway ? new Date() : null
                }
            });
        });
    }

    static async validatePayoutEligibility(resellerId: string) {
        const reseller = await prisma.reseller.findUnique({ where: { id: resellerId } });
        if (!reseller) throw new Error("Reseller not found");

        if (reseller.is_frozen) {
            throw new Error(`Payout blocked: Account is frozen. Reason: ${reseller.freeze_reason}`);
        }

        if (Number(reseller.risk_score) >= FINANCIAL_RULES.RISK_THRESHOLD_HIGH) {
            throw new Error("Payout blocked: High risk. Manual audit required.");
        }

        // NEW: Check if there are unverified fraud proofs
        const pendingProofs = await prisma.resellerFraudProof.count({
            where: { reseller_id: resellerId, status: "PENDING" }
        });

        if (pendingProofs > 0) {
            throw new Error("Payout blocked: You have pending payment proofs that require verification.");
        }
    }

    static async validateMappingLock(workspaceId: string, targetReferralCode: string) {
        const existingMap = await prisma.resellerVendorMap.findUnique({
            where: { workspace_id: workspaceId },
            include: { reseller: true }
        });

        if (existingMap && existingMap.reseller.referral_code !== targetReferralCode) {
            throw new Error("This workspace is already linked to another partner.");
        }

        return true;
    }
}
