
import { prisma } from "../db";
import { Decimal } from "@prisma/client/runtime/library";

/**
 * Super Admin CRM Service (Grafty Platform Sales Intelligence)
 * Manages revenue generation, vendor onboarding, and sales pipeline tracking.
 */
export class CRMService {
    /**
     * GET LEADS: Fetches high-level prospects for the super admin war room.
     */
    static async getLeads(filters: any = {}) {
        return await prisma.cRMLead.findMany({
            where: filters,
            include: {
                manager: true,
                activities: {
                    orderBy: { created_at: 'desc' },
                    take: 10
                }
            },
            orderBy: { updated_at: 'desc' }
        });
    }

    /**
     * PIPELINE STATS: Calculated executives KPIs for the dashboard.
     */
    static async getPipelineStats() {
        const leads = await prisma.cRMLead.findMany();

        const STAGE_CONFIG = [
            { id: "LEAD_CAPTURED", weight: 10 },
            { id: "CONTACTED", weight: 25 },
            { id: "DEMO_SCHEDULED", weight: 50 },
            { id: "PROPOSAL_SENT", weight: 70 },
            { id: "NEGOTIATION", weight: 85 },
            { id: "WON", weight: 100 },
            { id: "LOST", weight: 0 }
        ];

        const stats = STAGE_CONFIG.reduce((acc: any, config) => {
            const stageLeads = leads.filter(l => l.stage === config.id);
            acc[config.id] = {
                count: stageLeads.length,
                value: stageLeads.reduce((sum, l) => sum + Number(l.deal_value || 0), 0),
                leads: stageLeads.slice(0, 5)
            };
            return acc;
        }, {});

        // Forecast: Weighted Sum based on probability or stage weight
        const forecast = leads.reduce((sum, l) => {
            if (["WON", "LOST"].includes(l.stage)) return sum;
            const probability = l.probability || STAGE_CONFIG.find(s => s.id === l.stage)?.weight || 10;
            return sum + (Number(l.deal_value || 0) * (probability / 100));
        }, 0);

        return {
            stages: stats,
            forecast,
            total_active_value: leads.reduce((sum, l) => sum + Number(l.deal_value || 0), 0)
        };
    }

    /**
     * CAPTURE LEAD: Initial ingestion point from ads/landing/direct.
     */
    static async captureLead(data: any) {
        return await prisma.cRMLead.create({
            data: {
                name: data.name,
                email: data.email,
                phone: data.phone,
                type: data.type || "VENDOR",
                source: data.source || "DIRECT",
                deal_value: new Decimal(data.deal_value || 0),
                probability: data.probability || 10,
                stage: data.stage_id || "LEAD_CAPTURED", // Support both stage and stage_id
                company_name: data.company_name,
                activities: {
                    create: {
                        action: "LEAD_CAPTURED",
                        description: `Prospecting initiated via ${data.source || 'Direct Channel'}`
                    }
                }
            }
        });
    }

    /**
     * STAGE CHANGE: Atomic transition with activity logging and automation.
     */
    static async updateStage(leadId: string, newStage: string, adminId: string) {
        const lead = await prisma.cRMLead.findUnique({ 
            where: { id: leadId },
            select: { id: true, stage: true } 
        });
        
        if (!lead) throw new Error("Lead identity not found in database");
        if (lead.stage === newStage) return lead; // No-op

        const result = await prisma.$transaction(async (tx) => {
            const updated = await tx.cRMLead.update({
                where: { id: leadId },
                data: { 
                    stage: newStage,
                    updated_at: new Date()
                }
            });

            await tx.cRMActivity.create({
                data: {
                    lead_id: leadId,
                    admin_id: adminId,
                    action: "STAGE_CHANGE",
                    description: `Pipeline advancement: ${lead.stage} → ${newStage}`,
                    details: { from: lead.stage, to: newStage }
                }
            });

            return updated;
        });

        // Trigger asynchronous automation hooks
        try {
            const { SalesAutomationService } = await import("./sales-automation-service");
            if (newStage === "WON") {
                await SalesAutomationService.handleLeadWon(leadId);
            } else if (newStage === "PROPOSAL_SENT") {
                await SalesAutomationService.handleProposalSent(leadId);
            }
        } catch (autoErr) {
            console.error("Sales Automation Link Failure:", autoErr);
        }

        return result;
    }

    /**
     * REVENUE GOALS: Tracks platform growth targets.
     */
    static async getRevenueGoals() {
        const goals = await prisma.salesTarget.findMany({
            orderBy: [{ year: 'desc' }, { month: 'desc' }]
        });
        return goals.map(g => ({
            ...g,
            target_value: Number(g.target_value || 0),
            current_value: Number(g.current_value || 0)
        }));
    }

    /**
     * UPDATE TARGET: Upsert Monthly KPIs.
     */
    static async updateTarget(year: number, month: number, type: string, targetValueValue: number) {
        // Correcting common composite unique check
        const compositeKey = { year, month, type };
        
        return await prisma.salesTarget.upsert({
            where: {
                year_month_type: compositeKey
            },
            update: { target_value: new Decimal(targetValueValue) },
            create: { 
                year, 
                month, 
                type, 
                target_value: new Decimal(targetValueValue),
                current_value: new Decimal(0)
            }
        });
    }

    /**
     * ADD ACTIVITY: Manual log entry for interactions.
     */
    static async addActivity(leadId: string, data: { action: string, description: string, adminId: string, details?: any }) {
        return await prisma.cRMActivity.create({
            data: {
                lead_id: leadId,
                admin_id: data.adminId === "SYSTEM" ? null : data.adminId,
                action: data.action,
                description: data.description,
                details: data.details
            }
        });
    }
}
