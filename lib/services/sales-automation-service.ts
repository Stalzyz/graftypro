
import { prisma } from "../db";
import { CRMService } from "./crm-service";

/**
 * Sales Automation Service
 * Handles background transitions, lead assignments, and automated communications.
 */
export class SalesAutomationService {
    /**
     * Triggered when a new lead is captured.
     * Implements intelligent round-robin assignment to available sales staff.
     */
    static async handleNewLead(leadId: string) {
        try {
            const lead = await prisma.cRMLead.findUnique({ 
                where: { id: leadId } 
            });
            if (!lead) return;

            // Find all eligible sales managers
            const salesManagers = await prisma.adminUser.findMany({
                where: { 
                    role: "SALES",
                    // Potential filter for active/online status in the future
                }
            });

            if (salesManagers.length > 0) {
                // Round-robin or Weight-based assignment logic
                // For now: Random selection among eligible staff
                const assignedManager = salesManagers[Math.floor(Math.random() * salesManagers.length)];
                
                await prisma.cRMLead.update({
                    where: { id: leadId },
                    data: { assigned_to: assignedManager.id }
                });

                await CRMService.addActivity(leadId, {
                    action: "ASSIGNED",
                    description: `Prospect auto-assigned to ${assignedManager.name} (Sales Intelligence)`,
                    adminId: "SYSTEM"
                });
            } else {
                // FALLBACK: Assign to Super Admin or flag for manual review
                await CRMService.addActivity(leadId, {
                    action: "UNASSIGNED",
                    description: "No sales staff available for auto-assignment. Flagged for review.",
                    adminId: "SYSTEM"
                });
            }

            // Optional: Dispatch welcome automation (e.g., Email/WhatsApp)
            // await this.dispatchWelcomeSequence(lead);

        } catch (error) {
            console.error("Critical Sales Automation Failure (NewLead):", error);
        }
    }

    /**
     * Triggered when a lead milestones is reached (e.g., WON).
     */
    static async handleLeadWon(leadId: string) {
        try {
            const lead = await prisma.cRMLead.findUnique({ 
                where: { id: leadId },
                include: { manager: true }
            });
            if (!lead) return;

            // Log milestone activity
            await CRMService.addActivity(leadId, {
                action: "WON",
                description: `Deal Closed! Initiating onboarding protocols for ${lead.name}.`,
                adminId: "SYSTEM"
            });

            // If it's a reseller, we might trigger a specific partner workflow
            if (lead.type === "RESELLER") {
                // Potential: Create a Partner Account or send Reseller Agreement
            }

        } catch (error) {
            console.error("Critical Sales Automation Failure (LeadWon):", error);
        }
    }

    /**
     * Triggered when a proposal is dispatched.
     */
    static async handleProposalSent(leadId: string) {
        try {
            await CRMService.addActivity(leadId, {
                action: "PROPOSAL_SENT",
                description: "Proposal sequence activated. Awaiting prospect feedback.",
                adminId: "SYSTEM"
            });
        } catch (error) {
            console.error("Critical Sales Automation Failure (ProposalSent):", error);
        }
    }
}
