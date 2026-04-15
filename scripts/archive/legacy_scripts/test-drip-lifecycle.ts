
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function testDripLifecycle() {
    console.log("Testing Drip Lifecycle...");
    const workspace = await prisma.workspace.findFirst();
    if (!workspace) {
        console.log("No workspace found, skipping test.");
        return;
    }

    try {
        console.log("Creating dummy drip...");
        const drip = await prisma.dripSequence.create({
            data: {
                workspace_id: workspace.id,
                name: "Nuclear Test Drip",
                status: "ACTIVE",
                steps: {
                    create: [
                        { step_order: 1, delay_hours: 1 }
                    ]
                }
            },
            include: { steps: true }
        });
        console.log("Drip created:", drip.id);

        console.log("Querying drips with analytics...");
        const drips = await prisma.dripSequence.findMany({
            where: { workspace_id: workspace.id },
            include: {
                steps: {
                    include: { analytics: true }
                }
            }
        });
        console.log("Query success, found", drips.length, "drips.");

        console.log("Cleaning up...");
        await prisma.dripSequence.delete({ where: { id: drip.id } });
        console.log("Cleanup success.");

    } catch (e) {
        console.error("LIFECYCLE TEST FAILED:", e);
    }
}

testDripLifecycle().catch(console.error).finally(() => prisma.$disconnect());
