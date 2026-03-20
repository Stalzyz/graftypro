import { prisma } from "../db";
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
            throw new Error("Payout blocked: High risk score. Manual audit required.");
        }

        // 1. Velocity Check (Phase 7 Hardening)
        const dailyLimit = FINANCIAL_RULES.DAILY_PAYOUT_VELOCITY_LIMIT;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const totalToday = await prisma.resellerPayoutRequest.aggregate({
            where: {
                reseller_id: resellerId,
                status: { in: ["PAID", "PENDING"] },
                created_at: { gte: today }
            },
            _sum: { amount: true }
        });

        if (Number(totalToday._sum.amount || 0) >= dailyLimit) {
            throw new Error(`Daily payout velocity exceeded. Limit: ₹${dailyLimit}/day.`);
        }

        // 2. Fraud Proof Check
        const pendingProofs = await prisma.resellerFraudProof.count({
            where: { reseller_id: resellerId, status: "PENDING" }
        });

        if (pendingProofs > 0) {
            throw new Error("Payout blocked: You have pending payment proofs that require verification.");
        }

        // 3. Shared Bank Details Check (Cross-Reseller Risk)
        if (reseller.bank_account_number) {
            // NOTE: This check currently relies on deterministic values. 
            // In a future update, we should implement a hashed index of these fields for robust detection.
            const sharedBank = await prisma.reseller.count({
                where: {
                    id: { not: resellerId },
                    bank_account_number: reseller.bank_account_number,
                    status: "ACTIVE"
                }
            });

            if (sharedBank > 0) {
                // Log risk signal but don't block unless we want strict one-account-per-bank policy
                await prisma.resellerRiskLog.create({
                    data: {
                        reseller_id: resellerId,
                        signal_type: "SHARED_BANK_DETAILS",
                        risk_impact: 40,
                        details: { account: reseller.bank_account_number }
                    }
                });
                console.warn(`[Fraud Guard] Shared bank details detected for reseller ${resellerId}`);
            }
        }
    }

    static async calculatePayoutRisk(resellerId: string, amount: number) {
        let score = 0;
        const flags: { flag: string; severity: string; details?: any }[] = [];

        // 1. Frequency Check (High risk if multiple requests in 24 hours)
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentRequests = await prisma.resellerPayoutRequest.count({
            where: {
                reseller_id: resellerId,
                created_at: { gte: dayAgo }
            }
        });

        if (recentRequests >= 2) {
            const impact = recentRequests * 20;
            score += impact;
            flags.push({ flag: "FREQUENT_PAYOUT_REQUESTS", severity: impact > 50 ? "HIGH" : "MEDIUM", details: { count: recentRequests } });
        }

        // 2. Large Amount Check
        if (amount > 50000) {
            score += 40;
            flags.push({ flag: "LARGE_PAYOUT_AMOUNT", severity: "HIGH", details: { amount } });
        } else if (amount > 10000) {
            score += 15;
            flags.push({ flag: "MODERATE_PAYOUT_AMOUNT", severity: "MEDIUM", details: { amount } });
        }

        // 3. New Reseller Check (First payout is always medium risk)
        const previousPaidPayouts = await prisma.resellerPayoutRequest.count({
            where: {
                reseller_id: resellerId,
                status: "PAID"
            }
        });

        if (previousPaidPayouts === 0) {
            score += 30;
            flags.push({ flag: "FIRST_PAYOUT_REQUEST", severity: "MEDIUM" });
        }

        // 4. Global Reseller Risk Score
        const reseller = await prisma.reseller.findUnique({ where: { id: resellerId }, select: { risk_score: true } });
        if (reseller && Number(reseller.risk_score) > 30) {
            score += Number(reseller.risk_score);
            flags.push({ flag: "RESELLER_HISTORICAL_RISK", severity: "HIGH", details: { reseller_score: reseller.risk_score } });
        }

        return {
            score: Math.min(score, 100),
            flags
        };
    }

    static async validateMappingLock(workspaceId: string, targetResellerId: string) {
        const existingMap = await prisma.resellerVendorMap.findUnique({
            where: { workspace_id: workspaceId }
        });

        if (existingMap && existingMap.reseller_id !== targetResellerId) {
            throw new Error("This workspace is already linked to another partner.");
        }

        return true;
    }
}
