import { prisma } from "@/lib/db";
import { campaignQueue } from "@/lib/queue";

export class EduBroadcastService {
    /**
     * Creates a specialized broadcast for educational leads
     */
    static async createBroadcast(workspaceId: string, data: {
        name: string,
        templateName: string,
        targetStatus?: string[],
        course?: string
    }) {
        // 1. Create the general Campaign record first to track stats
        const campaign = await prisma.campaign.create({
            data: {
                workspace_id: workspaceId,
                name: data.name,
                template_name: data.templateName,
                status: "PROCESSING",
                filters: {
                    type: "EDU_LEADS",
                    targetStatuses: data.targetStatus,
                    course: data.course
                }
            }
        });

        // 2. Add specific Edu job to queue (or use existing but add metadata)
        await campaignQueue.add(
            "edu-bulk-broadcast",
            {
                campaignId: campaign.id,
                workspaceId: workspaceId,
                targetStatus: data.targetStatus,
                course: data.course
            }
        );

        return campaign;
    }
}
