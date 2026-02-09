import { prisma } from "@/lib/db";
import { automationQueue } from "@/lib/queue";
import { RazorpayManager } from "@/lib/payments/razorpay";

export class EduService {
    /**
     * PHASE 1: Lead Capture & Auto-Automation Trigger
     */
    static async captureLead(workspaceId: string, data: any) {
        const lead = await prisma.eduLead.create({
            data: {
                workspace_id: workspaceId,
                form_id: data.form_id,
                student_name: data.student_name,
                parent_name: data.parent_name,
                whatsapp_number: data.whatsapp_number,
                email: data.email,
                grade: data.grade,
                course_interested: data.course_interested,
                budget_range: data.budget_range,
                city: data.city,
                status: "NEW",
                potential_revenue: data.potential_revenue || 5000 // Default estimation
            }
        });

        // Trigger Instant Follow-up (Phase 3)
        // Trigger Instant Follow-up (Phase 3)
        // await automationQueue.add(
        //     "edu-lead-followup",
        //     { workspaceId, leadId: lead.id, type: "INSTANT_BROCHURE" },
        //     { delay: 2 * 60 * 1000 } // Send after 2 minutes to feel "human"
        // );

        return lead;
    }

    /**
     * PHASE 2: Pipeline Movement
     */
    static async updateLeadStatus(leadId: string, status: any) {
        const lead = await prisma.eduLead.update({
            where: { id: leadId },
            data: { status }
        });

        // If status is DEMO_SCHEDULED, plan a reminder
        if (status === "DEMO_SCHEDULED") {
            // await automationQueue.add(
            //     "edu-lead-reminder",
            //     { leadId: lead.id, type: "DEMO_REMINDER" },
            //     { delay: 24 * 60 * 60 * 1000 } // Mock: 24h later
            // );
        }

        return lead;
    }

    /**
     * PHASE 5: Conversion Analytics
     */
    static async getAnalytics(workspaceId: string) {
        const totalLeads = await prisma.eduLead.count({ where: { workspace_id: workspaceId } });
        const enrolledCount = await prisma.eduLead.count({
            where: { workspace_id: workspaceId, status: "ENROLLED" }
        });

        const totalRevenue = await prisma.eduLead.aggregate({
            where: { workspace_id: workspaceId, status: "ENROLLED" },
            _sum: { potential_revenue: true }
        });

        const pendingPayment = await prisma.eduLead.count({
            where: { workspace_id: workspaceId, status: "PAYMENT_PENDING" }
        });

        return {
            totalLeads,
            enrolledCount,
            conversionRate: totalLeads > 0 ? (enrolledCount / totalLeads) * 100 : 0,
            revenue: totalRevenue._sum.potential_revenue || 0,
            pendingPayment
        };
    }

    /**
     * PHASE 7: Pre-built High-Converting Templates (Logic)
     */
    static getRequiredTemplates() {
        return [
            {
                name: "Admission Inquiry Flow",
                type: "INQUIRY",
                message: "Hi! Thanks for inquiring about {{course}}. Can I share the brochure?"
            },
            {
                name: "Demo Class Reminder",
                type: "SEQUENCE",
                message: "Reminder: Your demo session for {{course}} starts in 2 hours!"
            },
            {
                name: "Payment Urgency",
                type: "DRIP",
                message: "Only 5 seats left for our {{course}} batch. Complete payment to secure yours!"
            }
        ];
    }

    /**
     * PHASE 4: Payment Logic
     */
    static async generateAdmissionPaymentLink(workspaceId: string, leadId: string) {
        const lead = await prisma.eduLead.findUnique({
            where: { id: leadId }
        });

        if (!lead) throw new Error("Lead not found");

        // 1. Generate Razorpay Link
        const link = await RazorpayManager.createPaymentLink(
            workspaceId,
            Number(lead.potential_revenue),
            "INR",
            `Admission Fee: ${lead.course_interested} - ${lead.student_name}`,
            {
                name: lead.student_name,
                contact: lead.whatsapp_number,
                email: lead.email || "no-email@wabot.in"
            },
            { eduLeadId: lead.id }
        );

        // 2. Update Lead Status
        await prisma.eduLead.update({
            where: { id: leadId },
            data: {
                status: "PAYMENT_PENDING",
                notes: lead.notes + `\n[Payment Link Generated: ${link.short_url}]`
            }
        });

        return link;
    }

    /**
     * PHASE 6: Meta Flow Integration
     * Processes native WhatsApp Flow submissions for inquiries
     */
    static async handleMetaFlowSubmission(workspaceId: string, phone: string, data: any) {
        // If the flow data looks like an inquiry (has student_name or course)
        if (data.student_name || data.course_interested) {
            console.log(`📝 [EduService] Processing Meta Flow Inquiry for ${phone}`);

            return await this.captureLead(workspaceId, {
                student_name: data.student_name || "Meta Flow User",
                whatsapp_number: phone,
                course_interested: data.course_interested || data.course,
                email: data.email,
                grade: data.grade || data.class,
                city: data.city,
                form_id: "META_FLOW_INQUIRY"
            });
        }
    }
}
