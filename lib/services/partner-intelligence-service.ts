
import { prisma } from "../db";

export class PartnerIntelligenceService {
    static async getPartnerHealth(partnerId: string) {
        const partner = await prisma.reseller.findUnique({
            where: { id: partnerId },
            include: {
                workspaces: {
                    include: {
                        wallet: true,
                        orders: true
                    }
                }
            }
        });

        if (!partner) return null;

        const totalVendors = partner.workspaces.length;
        const totalRevenue = partner.workspaces.reduce((sum, w) => sum + w.orders.reduce((os, o) => os + Number(o.total_amount), 0), 0);

        // Risk Indicators
        const risks = [];

        // 1. Low Credit Check
        const lowCreditVendors = partner.workspaces.filter(w => Number(w.wallet?.current_balance || 0) < 10);
        if (lowCreditVendors.length > totalVendors * 0.3) {
            risks.push({ level: "MEDIUM", type: "LOW_CREDIT", message: "Over 30% of vendors have low balance." });
        }

        // 2. Inactive Check (Last activity > 30 days)
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 30);
        const inactiveVendors = partner.workspaces.filter(w => w.updated_at < ninetyDaysAgo);
        if (inactiveVendors.length > totalVendors * 0.5) {
            risks.push({ level: "HIGH", type: "INACTIVE", message: "Over 50% of vendors are inactive." });
        }

        // 3. High Refund Check
        const totalRefunded = await prisma.invoice.count({
            where: { reseller_id: partnerId, status: "CANCELLED" }
        });
        const totalInvoices = await prisma.invoice.count({
            where: { reseller_id: partnerId }
        });
        if (totalInvoices > 0 && (totalRefunded / totalInvoices) > 0.1) {
            risks.push({ level: "CRITICAL", type: "HIGH_REFUND", message: "Refund rate exceeds 10%." });
        }

        return {
            stats: {
                totalVendors,
                totalRevenue,
                walletBalance: Number(partner.wallet_balance),
                churnRate: "4.2%" // Calculation placeholder
            },
            risks,
            overallScore: risks.length > 2 ? "RISKY" : risks.length > 0 ? "STABLE" : "EXCELLENT"
        };
    }

    static async getGlobalIntelligence() {
        const partners = await prisma.reseller.findMany();
        const results = await Promise.all(partners.map(p => this.getPartnerHealth(p.id)));
        return results.filter(r => r !== null);
    }
}
