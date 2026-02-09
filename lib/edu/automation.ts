import { prisma } from "@/lib/db";
import { WhatsAppService } from "@/lib/whatsapp/service";

export class EduAutomation {
    /**
     * Handles automated follow-up jobs (e.g., sending brochures after inquiry)
     */
    static async handleFollowup(data: { workspaceId: string, leadId: string, type: string }) {
        const { workspaceId, leadId, type } = data;

        const lead = await prisma.eduLead.findUnique({
            where: { id: leadId },
            include: {
                workspace: {
                    include: { waba: true }
                }
            }
        });

        if (!lead || !lead.workspace?.waba) {
            console.warn(`[EduAutomation] Lead ${leadId} or WABA not found for followup`);
            return;
        }

        const waba = lead.workspace.waba;

        if (type === "INSTANT_BROCHURE") {
            const message = `Hi ${lead.student_name}! 👋 Thanks for inquiring about our ${lead.course_interested || "courses"} at ${lead.workspace.name}. \n\nI've attached our latest brochure for your reference. Do you have any specific questions about the curriculum?`;

            await WhatsAppService.sendText(
                waba.phone_number_id,
                waba.access_token,
                lead.whatsapp_number,
                message
            );

            console.log(`📩 [EduAutomation] Sent Instant Brochure to ${lead.student_name}`);
        }
    }

    /**
     * Handles reminder jobs (e.g., demo class reminders)
     */
    static async handleReminder(data: { leadId: string, type: string }) {
        const { leadId, type } = data;

        const lead = await prisma.eduLead.findUnique({
            where: { id: leadId },
            include: {
                workspace: {
                    include: { waba: true }
                }
            }
        });

        if (!lead || !lead.workspace?.waba || lead.status === "LOST" || lead.status === "ENROLLED") {
            return; // Don't remind if they already converted or opted out
        }

        const waba = lead.workspace.waba;

        if (type === "DEMO_REMINDER") {
            const message = `Hi ${lead.student_name}! Just a quick reminder about your demo session for ${lead.course_interested} scheduled for tomorrow. 📚\n\nAre you still planed to join? Reply 'YES' to confirm!`;

            await WhatsAppService.sendText(
                waba.phone_number_id,
                waba.access_token,
                lead.whatsapp_number,
                message
            );

            console.log(`⏰ [EduAutomation] Sent Demo Reminder to ${lead.student_name}`);
        }
    }
}
