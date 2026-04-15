
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deepDiag() {
    console.log("--- NEURAL ENGINE DEEP DIAGNOSTIC v2 ---");
    try {
        console.log("1. Testing Connection...");
        await prisma.$connect();
        
        console.log("2. Checking pgvector extension...");
        const extensions = await prisma.$queryRaw`SELECT * FROM pg_extension WHERE extname = 'vector'`;
        console.log("   Extension result:", JSON.stringify(extensions));

        console.log("3. Checking Table existence (schema search)...");
        const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`;
        console.log("   Tables found in public schema:", tables.map(t => t.table_name).join(", "));

        console.log("4. Final desperate source check (Workspace Agnostic)...");
        try {
            const allSources = await prisma.$queryRaw`SELECT id, name, workspace_id, status FROM "knowledge_sources" LIMIT 10`;
            console.log("   RAW SOURCES IN DB:", JSON.stringify(allSources, null, 2));
        } catch (e) {
            console.error("   ❌ RAW SOURCE QUERY FAILED:", e.message);
        }

        console.log("5. Checking Current Workspaces...");
        try {
            const workspaces = await prisma.$queryRaw`SELECT id, name FROM "workspaces" LIMIT 5`;
            console.log("   WORKSPACES IN DB:", JSON.stringify(workspaces, null, 2));
        } catch (e) {
            console.error("   ❌ WORKSPACE QUERY FAILED:", e.message);
        }

    } catch (err) {
        console.error("❌ DIAGNOSTIC CRASHED:", err.message);
    } finally {
        await prisma.$disconnect();
    }
}

deepDiag();
