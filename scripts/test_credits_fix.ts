import { prisma } from "../lib/db";

async function main() {
    const workspaceId = "e8a77432-a550-4fbe-9687-4699c3fadb9b";
    console.log(`🔍 Pre-flight check simulation for workspace: ${workspaceId}`);

    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { 
            status: true, 
            current_plan_id: true, 
            name: true, 
            billing_email: true, 
            reseller: true,
            users: {
                select: { email: true },
                take: 1
            }
        }
    });

    console.log("Result:", JSON.stringify(workspace, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
