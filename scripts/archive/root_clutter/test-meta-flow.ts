
import { EduService } from "./lib/edu/service";
import { prisma } from "./lib/db";

async function main() {
    console.log("Testing EduService.handleMetaFlowSubmission...");

    // Using the known workspace ID
    const workspaceId = "d75b2b5c-2157-4521-9e94-e65a3dd870a7";
    const phone = "919988776655";
    const flowData = {
        student_name: "Meta Flow Student",
        course_interested: "Data Science",
        city: "Mumbai",
        email: "metaflow@example.com"
    };

    try {
        const lead = await EduService.handleMetaFlowSubmission(workspaceId, phone, flowData);
        console.log("Lead captured from Meta Flow:", lead);
    } catch (error) {
        console.error("Error testing Meta Flow submission:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
