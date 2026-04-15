
import { prisma } from "../lib/db";

async function diag() {
    try {
        const sources = await prisma.knowledgeSource.findMany({
            take: 20,
            select: { id: true, name: true, workspace_id: true, status: true }
        });
        console.log("--- DIAGNOSTIC: KNOWLEDGE SOURCES (JSON) ---");
        console.log(JSON.stringify(sources, null, 2));
        
        const counts = await prisma.knowledgeSource.groupBy({
            by: ['workspace_id'],
            _count: { _all: true }
        });
        console.log("--- SOURCES PER WORKSPACE (JSON) ---");
        console.log(JSON.stringify(counts, null, 2));

    } catch (err) {
        console.error("DIAGNOSTIC FAILED:", err);
    } finally {
        await prisma.$disconnect();
    }
}

diag();
