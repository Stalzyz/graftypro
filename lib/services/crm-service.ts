
import { prisma } from "../db";
import { Decimal } from "@prisma/client/runtime/library";

export class CRMService {
    static async getLeads(filters: any = {}) {
        return await prisma.cRMLead.findMany({
            where: filters,
            include: {
                manager: true,
                activities: {
                    orderBy: { created_at: 'desc' },
                    take: 5
                }
            },
            orderBy: { created_at: 'desc' }
        });
    }

    static async getPipelineStats() {
        const leads = await prisma.cRMLead.findMany();

        const stages = [
            "LEAD_CAPTURED", "CONTACTED", "DEMO_SCHEDULED",
            "PROPOSAL_SENT", "NEGOTIATION", "WON", "LOST"
        ];

        const stats = stages.reduce((acc: any, stage) => {
            const stageLeads = leads.filter(l => l.stage === stage);
            acc[stage] = {
                count: stageLeads.length,
                value: stageLeads.reduce((sum, l) => sum + Number(l.deal_value), 0),
                leads: stageLeads.slice(0, 5)
            };
            return acc;
        }, {});

        // Forecast: Sum(Deal Value * Probability)
        const forecast = leads.reduce((sum, l) => {
            if (["WON", "LOST"].includes(l.stage)) return sum;
            return sum + (Number(l.deal_value) * (l.probability / 100));
        }, 0);

        return {
            stages: stats,
            forecast,
            total_active_value: leads.reduce((sum, l) => sum + Number(l.deal_value), 0)
        };
    }

    static async captureLead(data: any) {
        return await prisma.cRMLead.create({
            data: {
                ...data,
                stage: "LEAD_CAPTURED",
                activities: {
                    create: {
                        action: "LEAD_CAPTURED",
                        description: `Lead capture initialized from ${data.source || 'Direct Source'}`
                    }
                }
            }
        });
    }

    static async updateStage(leadId: string, newStage: string, adminId: string) {
        const lead = await prisma.cRMLead.findUnique({ where: { id: leadId } });
        if (!lead) throw new Error("Lead not found");

        const result = await prisma.$transaction(async (tx) => {
            const updated = await tx.cRMLead.update({
                where: { id: leadId },
                data: { stage: newStage }
            });

            await tx.cRMActivity.create({
                data: {
                    lead_id: leadId,
                    admin_id: adminId,
                    action: "STAGE_CHANGE",
                    description: `Moved from ${lead.stage} to ${newStage}`,
                    details: { old_stage: lead.stage, new_stage: newStage }
                }
            });

            // Trigger Automation (After Commit/In Transaction if safe, or post-process)
            return updated;
        });

        // Async automation hooks
        const { SalesAutomationService } = await import("./sales-automation-service");
        if (newStage === "WON") {
            await SalesAutomationService.handleLeadWon(leadId);
        } else if (newStage === "PROPOSAL_SENT") {
            await SalesAutomationService.handleProposalSent(leadId);
        }

        return result;
    }

    static async addActivity(leadId: string, data: { action: string, description: string, adminId: string, details?: any }) {
        return await prisma.cRMActivity.create({
            data: {
                lead_id: leadId,
                admin_id: data.adminId,
                action: data.action,
                description: data.description,
                details: data.details
            }
        });
    }

    static async getRevenueGoals() {
        const goals = await prisma.salesTarget.findMany({
            orderBy: [{ year: 'desc' }, { month: 'desc' }]
        });
        return goals.map(g => ({
            ...g,
            target_value: Number(g.target_value || 0)
        }));
    }

    static async updateTarget(year: number, month: number, type: string, targetValue: number) {
        return await prisma.salesTarget.upsert({
            where: {
                year_month_type: { year, month, type }
            },
            update: { target_value: targetValue },
            create: { year, month, type, target_value: targetValue }
        });
    }
}
