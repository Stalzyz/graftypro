import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

/**
 * 🚀 AI KNOWLEDGE INGESTION API
 * NUCLEAR SHIM: To prevent Next.js from attempting to bundle Node-specific
 * dependencies (pdf-parse, cheerio) during 'npm run build', we dynamically 
 * import the engine only when the POST request is actually fired at runtime.
 */
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData: any = await req.formData();
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const content = formData.get("content") as string;
    const url = formData.get("url") as string;
    const fileEntry = formData.get("file");

    console.log(`[INGEST_API] Request Received: type=${type}, name=${name}, hasFile=${!!fileEntry}`);
    console.log(`[INGEST_API] Session Diagnostics: user=${user.userId}, workspace=${user.workspaceId || user.workspace_id || "NOT_FOUND"}`);

    // Safety Net: Ensure we have a workspace ID
    const activeWorkspaceId = user.workspaceId || user.workspace_id;

    if (!activeWorkspaceId) {
      console.error(`[INGEST_API] CRITICAL: No workspace ID found in session payload!`, user);
      return NextResponse.json({ error: "No active workspace associated with your session. Please re-login." }, { status: 400 });
    }

    if (!name || !type) {
      return NextResponse.json({ error: "Missing required fields (name, type)" }, { status: 400 });
    }

    let metadata: any = { url };

    // 1. Handle File Upload if PDF
    if (type === "PDF") {
      if (!fileEntry || !(fileEntry instanceof Blob)) {
        console.error(`[INGEST_API] ERROR: Expected PDF file but received: ${typeof fileEntry}`);
        return NextResponse.json({ error: "Valid PDF file is required for PDF type" }, { status: 400 });
      }

      const file = fileEntry as File;
      const { ImageUploadService } = require("@/lib/services/upload");
      
      try {
        const upload = await ImageUploadService.uploadImage(file, {
          module: "knowledge",
          tenantId: activeWorkspaceId,
          maxSize: 10 * 1024 * 1024 // 10MB
        });
        metadata.file_path = upload.url;
        metadata.original_name = upload.originalName;
      } catch (uploadErr: any) {
        console.error(`[INGEST_API] Upload Service Failed:`, uploadErr.message);
        return NextResponse.json({ error: `Upload failed: ${uploadErr.message}` }, { status: 500 });
      }
    }

    // 2. Create the Source record using RAW SQL (with explicit casting)
    const sourceId = require("crypto").randomUUID();
    try {
      await prisma.$executeRawUnsafe(
        `INSERT INTO "knowledge_sources" ("id", "workspace_id", "name", "type", "content", "metadata", "status", "created_at", "updated_at") 
         VALUES ($1, $2, $3, $4::"KnowledgeSourceType", $5, $6::jsonb, $7::"KnowledgeStatus", NOW(), NOW())`,
        sourceId,
        activeWorkspaceId,
        name,
        type,
        type === "TEXT" ? content : null,
        JSON.stringify(metadata || {}),
        "PENDING"
      );
    } catch (dbErr: any) {
        console.error(`[INGEST_API] Database Insert Failed:`, dbErr.message);
        return NextResponse.json({ error: `Database error: ${dbErr.message}` }, { status: 500 });
    }

    console.log(`[INGEST_API] Source Created: ${sourceId}. Triggering Engine...`);

    // 3. NUCLEAR WORKER DISPATCH: Move processing to Background Worker
    try {
      const { knowledgeQueue } = require("../../../../../lib/queue");
      if (knowledgeQueue) {
        await knowledgeQueue.add("ingest-knowledge", { sourceId }, {
            jobId: `INGEST-${sourceId}` // Prevent duplicates
        });
        console.log(`[INGEST_API] Job dispatched to Knowledge Queue for source: ${sourceId}`);
      } else {
          // Fallback if Redis is down (Self-Healing attempt)
          const { KnowledgeEngine } = require('../../../../../lib/ai/knowledge-engine');
          KnowledgeEngine.ingest(sourceId).catch((err: any) => console.error(`[INGEST_API] Fallback Engine Failed:`, err));
      }
    } catch (e: any) {
        console.error("[INGEST_API] Failed to dispatch to Knowledge Worker:", e.message);
        // Absolute last resort fallback
        const { KnowledgeEngine } = require('../../../../../lib/ai/knowledge-engine');
        KnowledgeEngine.ingest(sourceId).catch((err: any) => console.error(`[INGEST_API] Absolute Fallback Failed:`, err));
    }

    return NextResponse.json({ 
      success: true, 
      source_id: sourceId,
      message: "Ingestion started successfully" 
    });

  } catch (error: any) {
    console.error("[INGEST_API] FATAL ERROR:", error.message);
    return NextResponse.json({ error: "Internal Server Error: " + error.message }, { status: 500 });
  }
}

/**
 * 🔍 GET STATUS / LIST (AUTONOMOUS SELF-HEALING)
 */
export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            console.warn(`[INGEST_API] GET Attempted by unauthenticated user`);
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const activeWorkspaceId = user.workspaceId || user.workspace_id;
        if (!activeWorkspaceId) {
            console.error(`[INGEST_API] GET Failed: No workplace ID in session`, user);
            return NextResponse.json({ error: "No active workspace found" }, { status: 400 });
        }

        // Try querying. If it fails with 42P01, trigger self-heal.
        try {
            const sources: any[] = await prisma.$queryRawUnsafe(
                `SELECT s.id, s.name, s.type, s.status, s.created_at, 
                 (SELECT COUNT(*)::int FROM "knowledge_chunks" WHERE source_id = s.id) as chunk_count
                 FROM "knowledge_sources" s
                 WHERE s.workspace_id = $1
                 ORDER BY s.created_at DESC`,
                activeWorkspaceId
            );

            // 4. Neural Pulse Check: Auto-queue PENDING or FAILED ingestions on dashboard load
            const retrySources = sources.filter(s => s.status === 'PENDING' || s.status === 'FAILED');
            if (retrySources.length > 0) {
                console.log(`[INGEST_API] Pulse Check: Found ${retrySources.length} sources to heal. Dispatching to worker...`);
                const { knowledgeQueue } = require('../../../../../lib/queue');
                for (const ps of retrySources) {
                    if (knowledgeQueue) {
                        await knowledgeQueue.add("heal-knowledge", { sourceId: ps.id }, { jobId: `HEAL-${ps.id}` });
                    }
                }
            }

            const normalizedSources = sources.map(s => ({
                ...s,
                _count: { chunks: s.chunk_count }
            }));
            
            return NextResponse.json({ sources: normalizedSources });

        } catch (sqlErr: any) {
            if (sqlErr.message.includes("42P01") || sqlErr.message.includes("does not exist")) {
                console.warn(`[INGEST_API] 🛠️ AUTO-REPAIR TRIGGERED: Missing tables detected.`);
                
                // RECONSTRUCT INFRASTRUCTURE
                await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector;`);
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
                await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_kb_source" ON "knowledge_chunks"(source_id);`);
                await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_kb_workspace" ON "knowledge_chunks"(workspace_id);`);
                await prisma.$executeRawUnsafe(`CREATE INDEX IF NOT EXISTS "idx_kb_embedding" ON "knowledge_chunks" USING hnsw (embedding vector_cosine_ops);`);

                console.log(`[INGEST_API] ✅ AUTO-REPAIR COMPLETE. Retrying fetch...`);
                
                // RETRY ONCE
                const retrySources: any[] = await prisma.$queryRawUnsafe(
                    `SELECT s.id, s.name, s.type, s.status, s.created_at, 1 as chunk_count FROM "knowledge_sources" s WHERE s.workspace_id = $1`,
                    activeWorkspaceId
                );
                return NextResponse.json({ sources: retrySources });
            }
            throw sqlErr; // Re-throw if it wasn't a missing table error
        }

    } catch (error: any) {
        console.error("[INGEST_API] GET Error:", error.message);
        return NextResponse.json({ error: "Neural Link Error: " + error.message }, { status: 500 });
    }
}

/**
 * 🧹 WIPE ALL KNOWLEDGE (RAW SQL BRIDGE)
 */
export async function DELETE(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const activeWorkspaceId = user.workspaceId || user.workspace_id;

        const { searchParams } = new URL(req.url);
        const confirmAll = searchParams.get("all") === "true";

        if (!confirmAll) {
            return NextResponse.json({ error: "Missing confirmation parameter (?all=true)" }, { status: 400 });
        }

        console.log(`[INGEST_API] Wiping all intelligence for workspace: ${activeWorkspaceId}`);

        await prisma.$executeRawUnsafe(
            `DELETE FROM "knowledge_sources" WHERE workspace_id = $1`,
            activeWorkspaceId
        );

        return NextResponse.json({ 
            success: true, 
            message: "Neural memory wiped successfully." 
        });
    } catch (error: any) {
        console.error("[INGEST_API] Wipe All Error:", error.message);
        return NextResponse.json({ error: "Failed to wipe intelligence" }, { status: 500 });
    }
}
