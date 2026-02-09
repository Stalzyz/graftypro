
/**
 * scripts/test-edu-features.ts
 * 
 * Manual test script for validating Education Module features.
 * 
 * PRE-REQUISITES:
 * 1. Working environment (npm install success).
 * 2. Database connection available (DATABASE_URL configured).
 * 3. Run with: npx tsx scripts/test-edu-features.ts
 */

import { EduService } from "../lib/edu/service";
import { prisma } from "../lib/db";
import { randomUUID } from "crypto";

async function main() {
    console.log("🚀 Starting Education Module Feature Test...");

    // 1. Setup Test Workspace
    console.log("------------------------------------------------");
    console.log("1. Setting up Test Workspace...");
    const workspace = await prisma.workspace.create({
        data: {
            name: "Edu Test Academy",
            status: "ACTIVE"
        }
    });
    console.log(`✅ Created Workspace: ${workspace.id}`);

    try {
        // 2. Test Lead Capture
        console.log("------------------------------------------------");
        console.log("2. Testing Lead Capture...");
        const leadData = {
            form_id: "WEB_FORM",
            student_name: "Test Student 1",
            whatsapp_number: "919999988888",
            course_interested: "NEET Prep",
            city: "Delhi",
            email: "student1@example.com"
        };
        const lead1 = await EduService.captureLead(workspace.id, leadData);
        console.log(`✅ Captured Lead 1: ${lead1.id} (${lead1.course_interested})`);

        // 3. Test Meta Flow Submission
        console.log("------------------------------------------------");
        console.log("3. Testing Meta Flow Integration...");

        // Ensure dummy form exists (handled in real app by seed, doing manually here)
        await prisma.eduForm.upsert({
            where: { id: "META_FLOW_INQUIRY" },
            update: {},
            create: {
                id: "META_FLOW_INQUIRY",
                workspace_id: workspace.id,
                name: "Meta Flow Inquiry",
                type: "INQUIRY",
                fields: {}
            }
        });

        const flowData = {
            student_name: "Meta Student",
            course_interested: "JEE Mains",
            email: "meta@example.com"
        };
        const phone = "917777766666";

        const lead2 = await EduService.handleMetaFlowSubmission(workspace.id, phone, flowData);
        console.log(`✅ Captured Meta Flow Lead: ${lead2?.id} (${lead2?.course_interested})`);

        // 4. Test Analytics
        console.log("------------------------------------------------");
        console.log("4. Testing Analytics...");
        const analytics = await EduService.getAnalytics(workspace.id);
        console.log("Analytics Result:", analytics);

        if (analytics.totalLeads >= 2) {
            console.log("✅ Analytics: Total leads count matches expectations.");
        } else {
            console.warn("⚠️ Analytics: Total leads count mismatch.");
        }

        // 5. Test Course Breakdown (Raw DB Query verification)
        const breakdown = await prisma.eduLead.groupBy({
            by: ['course_interested'],
            where: { workspace_id: workspace.id },
            _count: { id: true }
        });
        console.log("Course Breakdown:", breakdown);
        if (breakdown.length >= 2) {
            console.log("✅ Course Breakdown verified.");
        }

    } catch (error) {
        console.error("❌ Test Failed:", error);
    } finally {
        // Cleanup (Optional)
        // await prisma.workspace.delete({ where: { id: workspace.id } });
        await prisma.$disconnect();
    }
}

main();
