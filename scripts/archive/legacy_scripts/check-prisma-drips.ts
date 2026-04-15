
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function checkDrips() {
    console.log("Checking Drip Models...");
    try {
        const models = Object.keys(prisma).filter(k => !k.startsWith("_"));
        console.log("Models available:", models.join(", "));

        const drip = await prisma.dripSequence.findFirst({
            include: {
                steps: {
                    include: {
                        analytics: true
                    }
                }
            }
        } as any);
        console.log("Drip query success!");
    } catch (e: any) {
        console.error("Drip query failed:", e.message);
        if (e.message.includes("Unknown field 'analytics'")) {
            console.log("CRITICAL: DripStep does not have 'analytics' relation in generated client!");
        }
    }
}

checkDrips().catch(console.error).finally(() => prisma.$disconnect());
