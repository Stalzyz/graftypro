
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reconstruct() {
    console.log("--- 🏗️ NEURAL RECONSTRUCTION IN PROGRESS ---");
    
    try {
        // 1. Enable Vector Extension
        console.log("1. Activating pgvector extension...");
        // Note: This requires superuser privileges or a DB with vector pre-installed.
        // It's the standard for managed Postgres (Supabase, Neon, etc.)
        await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);

        // 2. Create knowledge_sources table
        console.log("2. Reconstructing knowledge_sources table...");
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "knowledge_sources" (
                "id" TEXT NOT NULL,
                "workspace_id" TEXT NOT NULL,
                "name" TEXT NOT NULL,
                "type" TEXT NOT NULL,
                "status" TEXT NOT NULL DEFAULT 'PENDING',
                "content" TEXT,
                "metadata" JSONB DEFAULT '{}',
                "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT "knowledge_sources_pkey" PRIMARY KEY ("id"),
                CONSTRAINT "knowledge_sources_workspace_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE
            );
        `);

        // 3. Create knowledge_chunks table
        console.log("3. Reconstructing knowledge_chunks table...");
        await prisma.$executeRawUnsafe(`
            CREATE TABLE IF NOT EXISTS "knowledge_chunks" (
                "id" TEXT NOT NULL,
                "source_id" TEXT NOT NULL,
                "workspace_id" TEXT NOT NULL,
                "content" TEXT NOT NULL,
                "embedding" vector(1536),
                "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

                CONSTRAINT "knowledge_chunks_pkey" PRIMARY KEY ("id"),
                CONSTRAINT "knowledge_chunks_source_fkey" FOREIGN KEY ("source_id") REFERENCES "knowledge_sources"("id") ON DELETE CASCADE ON UPDATE CASCADE
            );
        `);

        // 4. Create Indexes for Vector Search
        console.log("4. Building Vector Intelligence Indexes...");
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "knowledge_chunks_source_idx" ON "knowledge_chunks"("source_id");`);
        await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "knowledge_chunks_workspace_idx" ON "knowledge_chunks"("workspace_id");`);

        console.log("--- ✅ RECONSTRUCTION COMPLETE ---");
        console.log("Neural Engine infrastructure is now physically present in the database.");

    } catch (error) {
        console.error("❌ RECONSTRUCTION FAILED:", error.message);
        if (error.message.includes("permission denied")) {
            console.error("CRITICAL: Superuser privileges required to enable 'vector' extension.");
        }
    } finally {
        await prisma.$disconnect();
    }
}

reconstruct();
