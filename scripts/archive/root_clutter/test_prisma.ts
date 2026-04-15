
import { prisma } from "@/lib/db";

async function main() {
    console.log("Testing Prisma Client...");
    try {
        // Create a dummy campaign to test fields
        const camp = await prisma.campaign.create({
            data: {
                workspace_id: "test",
                name: "Test Camp",
                // @ts-ignore
                flow_id: "test-flow", // Force it
                filters: {},
            }
        });
        console.log("Created:", camp);
    } catch (e) {
        console.log("Create failed (expected if FK missing):", e.message);
    }

    // Check if DripStepAnalytics model exists in client
    // @ts-ignore
    if (prisma.dripStepAnalytics) {
        console.log("✅ DripStepAnalytics Model Exists in Client");
    } else {
        console.log("❌ DripStepAnalytics Model MISSING in Client");
    }
}

main();
