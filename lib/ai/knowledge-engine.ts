import { prisma } from "../db";
import { AIService } from "./openai";
import axios from "axios";

export interface KnowledgeChunkInput {
  content: string;
  source_id: string;
  workspace_id: string;
}

export class KnowledgeEngine {
  /**
   * 🏗️ ATOMIC INGESTION: Process a Knowledge Source (RAW SQL BRIDGE)
   */
  static async ingest(sourceId: string) {
    // 1. Fetch Source via RAW SQL
    const sources: any[] = await prisma.$queryRawUnsafe(
        `SELECT * FROM "knowledge_sources" WHERE id = $1`,
        sourceId
    );
    const source = sources[0];

    if (!source) throw new Error("Knowledge source not found");
    
    // Atomic Guard: Prevent double-ingestion if already processing or completed
    if (source.status === "PROCESSING" || source.status === "COMPLETED") {
      console.log(`[KnowledgeEngine] Skipping ${sourceId}: Already ${source.status}`);
      return { success: true, skipped: true };
    }

    try {
      // 2. Update status to PROCESSING (RAW SQL with Full Casts)
      await prisma.$executeRawUnsafe(
        `UPDATE "knowledge_sources" SET status = 'PROCESSING'::"KnowledgeStatus", updated_at = NOW() WHERE id = $1`,
        sourceId
      );

      let rawText = "";

      // 3. Extract Text based on type
      if (source.type === "TEXT") {
        rawText = source.content || "";
      } else if (source.type === "URL") {
        const url = (source.metadata as any)?.url;
        if (!url) throw new Error("URL missing in metadata");
        rawText = await this.extractTextFromUrl(url);
      } else if (source.type === "PDF") {
        const filePath = (source.metadata as any)?.file_path;
        if (!filePath) throw new Error("File path missing in metadata");
        rawText = await this.extractTextFromPdf(filePath);
      }

      if (!rawText || rawText.trim().length < 50) {
        throw new Error("Extracted text is too short or empty.");
      }

      // 4. Chunk the text
      const chunks = this.chunkText(rawText);

      // 5. Wipe old chunks for this source if they exist (re-sync)
      await prisma.$executeRawUnsafe(
        `DELETE FROM "knowledge_chunks" WHERE source_id = $1`,
        sourceId
      );

      // 6. Generate Embeddings & Save Chunks
      console.log(`[KnowledgeEngine] Processing ${chunks.length} chunks for ${source.name}...`);
      
      for (const chunkText of chunks) {
        const embedding = await AIService.getEmbedding(chunkText);
        const embeddingSql = `[${embedding.join(",")}]`;
        const chunkId = require("crypto").randomUUID();
        
        // ☢️ NUCLEAR FIX: Explicit ::vector cast for $5 is REQUIRED for pgvector
        await prisma.$executeRawUnsafe(
          `INSERT INTO "knowledge_chunks" ("id", "source_id", "workspace_id", "content", "embedding", "created_at") 
           VALUES ($1, $2, $3, $4, $5::vector, NOW())`,
          chunkId,
          sourceId,
          source.workspace_id,
          chunkText,
          embeddingSql
        );
      }

      // 7. Finalize status (RAW SQL with Cast)
      await prisma.$executeRawUnsafe(
        `UPDATE "knowledge_sources" SET status = 'COMPLETED'::"KnowledgeStatus", content = $1, updated_at = NOW() WHERE id = $2`,
        rawText,
        sourceId
      );

      return { success: true, chunks: chunks.length };
    } catch (error: any) {
      console.error(`[KnowledgeEngine] Ingestion Failed for ${sourceId}:`, error.message);
      
      // Update metadata with the error for visibility
      const updatedMetadata = { 
        ...(source.metadata as any || {}), 
        error_diagnostic: error.message,
        failed_at: new Date().toISOString()
      };

      // Update status to FAILED (RAW SQL with Explicit JSONB and Enum Casts)
      await prisma.$executeRawUnsafe(
        `UPDATE "knowledge_sources" SET status = 'FAILED'::"KnowledgeStatus", metadata = $1::jsonb, updated_at = NOW() WHERE id = $2`,
        JSON.stringify(updatedMetadata),
        sourceId
      );
      throw error;
    }
  }

  /**
   * 📄 PDF EXTRACTION (NUCLEAR WORKER ENGINE)
   */
  private static async extractTextFromPdf(urlOrPath: string): Promise<string> {
    // ☢️ NUCLEAR SIMPLICITY: Runs in Worker context, no bundler issues!
    const pdf = require("pdf-parse");
    
    let buffer: Buffer;

    // Detect if this is a local API path and resolve it to the disk
    if (urlOrPath.startsWith("/api/media/local/")) {
      const { join } = require("path");
      const { readFile, stat } = require("fs/promises");
      
      const relativePath = urlOrPath.replace("/api/media/local/", "");
      const rootDir = process.cwd();
      
      // Monster Path Resolver: Try exhaustive candidates for both local dev and production VPS
      const pathsToTry = [
        join(rootDir, "public", "uploads", relativePath),
        join(rootDir, "public", "uploads", relativePath.replace(/^vendor\/?/, 'vendor')),
        join(rootDir, "public", "uploads", "knowledge", relativePath.split('/').pop() || ''),
        join(rootDir, "public", relativePath),
        // VPS Specific: Check root-level uploads if symlinked or volume-mounted
        join(rootDir, "uploads", relativePath),
        join("/app", "public", "uploads", relativePath) // Docker standard
      ];

      let foundPath = "";
      for (const p of pathsToTry) {
        try {
          const s = await stat(p);
          if (s.isFile()) {
            foundPath = p;
            console.log(`[KnowledgeEngine] 💿 Monster Match Found: ${p}`);
            break;
          }
        } catch (e) {}
      }

      if (!foundPath) {
        throw new Error(`[Phase: Extraction] PDF file not found on disk at any candidate path. Path provided: ${urlOrPath}`);
      }

      buffer = await readFile(foundPath);
    } else {
      // It's a remote URL
      console.log(`[KnowledgeEngine] 🌐 Remote Request: ${urlOrPath}`);
      const response = await axios.get(urlOrPath, { responseType: "arraybuffer" });
      buffer = Buffer.from(response.data);
    }

    const data = await pdf(buffer);
    return data.text;
  }

  /**
   * 🌐 URL SCRAPING (NUCLEAR ISOLATION)
   */
  private static async extractTextFromUrl(url: string): Promise<string> {
    const pkg = "chee";
    const rio = "rio";
    const cheerio = require(pkg + rio);
    
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    $("script, style, nav, footer, iframe, noscript").remove();
    return $("body").text().replace(/\s+/g, " ").trim();
  }

  /**
   * ✂️ CHUNKING LOGIC
   */
  private static chunkText(text: string, size = 1000, overlap = 200): string[] {
    const chunks: string[] = [];
    let start = 0;
    while (start < text.length) {
      const end = Math.min(start + size, text.length);
      chunks.push(text.slice(start, end));
      start += size - overlap;
    }
    return chunks;
  }
}
