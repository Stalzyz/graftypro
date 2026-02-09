import { prisma } from "@/lib/db";

export class CreditFraudGuard {
    /**
     * PHASE 7: FRAUD DETECTION
     * Detects anomalous spending patterns (Spikes).
     * If a vendor spends more than 5000 credits in 1 hour, it flags them.
     */
    static async checkSpendingAnomalies(workspaceId: string) {
        const oneHourAgo = new Date(Date.now() - (60 * 60 * 1000));

        const recentSpend = await prisma.creditTransaction.aggregate({
            where: {
                workspace_id: workspaceId,
                type: 'DEDUCTION',
                created_at: { gte: oneHourAgo }
            },
            _sum: { amount: true }
        });

        const totalSpent = Math.abs(Number(recentSpend._sum.amount || 0));

        // Threshold set to 5000 credits/hour for MVP
        if (totalSpent > 5000) {
            console.warn(`🚨 [Fraud Guard] High spend detected: ${workspaceId} spent ${totalSpent} in 1 hour.`);

            // Auto-Freeze if spend is truly excessive (e.g. > 20000/hr)
            if (totalSpent > 20000) {
                await prisma.vendorWallet.update({
                    where: { workspace_id: workspaceId },
                    data: {
                        is_frozen: true,
                        freeze_reason: "Automated freeze: Velocity limit exceeded (Spike Protection)"
                    }
                });
                return { flagged: true, frozen: true };
            }

            return { flagged: true, frozen: false };
        }

        return { flagged: false, frozen: false };
    }
}
