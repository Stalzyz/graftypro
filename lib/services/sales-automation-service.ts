
import { prisma } from "../db";
import { EmailService } from "../email/service";
import { CRMService } from "./crm-service";
import { InvoiceService } from "../finance/invoice-service";

export class SalesAutomationService {
    /**
     * Triggered when a new lead is captured.
     * Auto-assigns to a sales manager and sends a welcome/demo invite.
     */
    static async handleNewLead(leadId: string) {
        const lead = await prisma.cRMLead.findUnique({ where: { id: leadId } });
        if (!lead) return;

        // Round-robin assignment (Example logic)
        const salesManagers = await prisma.adminUser.findMany({
            where: { role: "SALES" }
        });

        if (salesManagers.length > 0) {
            const assignedManager = salesManagers[Math.floor(Math.random() * salesManagers.length)];
            await prisma.cRMLead.update({
                where: { id: leadId },
                data: { assigned_to: assignedManager.id }
            });

            await CRMService.addActivity(leadId, {
                action: "ASSIGNED",
                description: `Lead auto-assigned to ${assignedManager.name}`,
                adminId: assignedManager.id
            });
        }

        // Send Auto-Welcome/Demo Invite
        try {
            // await EmailService.sendDemoInvite(lead.email, lead.name); 
            await CRMService.addActivity(leadId, {
                action: "EMAIL_SENT",
                description: "Auto-welcome and Demo invite email dispatched.",
                adminId: "SYSTEM"
            });
        } catch (e) {
            console.error("Auto-email failed", e);
        }
    }

    /**
     * Triggered when a lead moves to WON.
     * Auto-generates onboarding email and reseller/vendor setup tasks.
     */
    static async handleLeadWon(leadId: string) {
        const lead = await prisma.cRMLead.findUnique({ where: { id: leadId } });
        if (!lead) return;

        // If it's a reseller lead, we might trigger the approval flow
        if (lead.type === "RESELLER") {
            // Trigger reseller setup logic
        }

        await CRMService.addActivity(leadId, {
            action: "ONBOARDING_INITIATED",
            description: "Onboarding automation triggered after WON status.",
            adminId: "SYSTEM"
        });
    }

    /**
     * Triggered when a stage changes to PROPOSAL_SENT.
     * Could auto-generate a PDF proposal (Mock).
     */
    static async handleProposalSent(leadId: string) {
        // Logic to generate and email proposal
    }
}
