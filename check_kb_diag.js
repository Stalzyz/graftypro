
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function checkKB() {
    console.log("--- KNOWLEDGE BASE DIAGNOSTICS ---");

    try {
        // 1. Check Tables
        const sourcesCount = await prisma.knowledgeSource.count();
        const chunksCount = await prisma.knowledgeChunk.count();
        console.log(`Knowledge Sources: ${sourcesCount}`);
        console.log(`Knowledge Chunks: ${chunksCount}`);

        if (sourcesCount > 0) {
            const latestSource = await prisma.knowledgeSource.findFirst({
                orderBy: { created_at: 'desc' },
                include: { _count: { select: { chunks: true } } }
            });
            console.log("Latest Source:", latestSource?.name, "Status:", latestSource?.status, "Chunks:", latestSource?._count?.chunks);
        }

        // 2. Check Plan for a sample workspace
        const workspaces = await prisma.workspace.findMany({
            take: 3,
            include: {
                plan_details: true
            }
        });

        console.log("\n--- PLANS ---");
        for (const ws of workspaces) {
            console.log(`Workspace: ${ws.name} (${ws.id.slice(0, 8)}...)`);
            console.log(` - Plan: ${ws.plan_details?.name || 'None'}`);
            console.log(` - AI Fallback Enabled: ${ws.plan_details?.ai_fallback_enabled || 'false'}`);
        }

    } catch (err) {
        console.error("Diagnostic Error:", err);
    } finally {
        await prisma.$disconnect();
    }
}

checkKB();
