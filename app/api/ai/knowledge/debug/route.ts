
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const diagnostic: any = {
        timestamp: new Date().toISOString(),
        tables: {
            sources: false,
            chunks: false
        },
        vector_extension: false,
        repair_attempted: false,
        errors: []
    };

    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized. Please login first." }, { status: 401 });

        console.log(`[NEURAL_DEBUG] Running diagnostics for user: ${user.userId}`);

        // 1. Check Tables & Extension
        try {
            const extCheck: any[] = await prisma.$queryRaw`SELECT extname FROM pg_extension WHERE extname = 'vector'`;
            diagnostic.vector_extension = extCheck.length > 0;
            
            await prisma.$queryRaw`SELECT 1 FROM "knowledge_sources" LIMIT 1`;
            diagnostic.tables.sources = true;
            
            await prisma.$queryRaw`SELECT 1 FROM "knowledge_chunks" LIMIT 1`;
            diagnostic.tables.chunks = true;
        } catch (checkErr: any) {
            console.log(`[NEURAL_DEBUG] Verification Failed. Tables likely missing: ${checkErr.message}`);
            diagnostic.errors.push(checkErr.message);
        }

        // 2. Perform Repair if missing
        if (!diagnostic.tables.sources || !diagnostic.tables.chunks || !diagnostic.vector_extension) {
            diagnostic.repair_attempted = true;
            console.log(`[NEURAL_DEBUG] REPAIR TRIGGERED: Tables or Extension missing.`);

            try {
                // A. Enable Vector
                await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
                
                // B. Create Sources
                await prisma.$executeRawUnsafe(`
                    CREATE TABLE IF NOT EXISTS "knowledge_sources" (
                        "id" TEXT PRIMARY KEY,
                        "workspace_id" TEXT NOT NULL,
                        "name" TEXT NOT NULL,
                        "type" TEXT NOT NULL,
                        "status" TEXT NOT NULL DEFAULT 'PENDING',
                        "content" TEXT,
                        "metadata" JSONB DEFAULT '{}',
                        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
                        "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
                    );
                `);

                // C. Create Chunks
                await prisma.$executeRawUnsafe(`
                    CREATE TABLE IF NOT EXISTS "knowledge_chunks" (
                        "id" TEXT PRIMARY KEY,
                        "source_id" TEXT NOT NULL,
                        "workspace_id" TEXT NOT NULL,
                        "content" TEXT NOT NULL,
                        "embedding" vector(1536),
                        "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
                    );
                `);

                // D. Indexes
                await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_kb_source" ON "knowledge_chunks"(source_id);`);
                await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_kb_workspace" ON "knowledge_chunks"(workspace_id);`);

                diagnostic.repair_status = "SUCCESS";
                console.log(`[NEURAL_DEBUG] REPAIR SUCCESSFUL.`);
            } catch (repairErr: any) {
                diagnostic.repair_status = "FAILED";
                diagnostic.errors.push(`Repair Error: ${repairErr.message}`);
                console.error(`[NEURAL_DEBUG] REPAIR FAILED:`, repairErr);
            }
        } else {
            diagnostic.repair_status = "NOT_NEEDED";
        }

        return NextResponse.json(diagnostic);

    } catch (fatal: any) {
        return NextResponse.json({ fatal: fatal.message, diagnostic }, { status: 500 });
    }
}
