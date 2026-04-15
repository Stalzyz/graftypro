import { join } from "path";
import { readFile } from "fs/promises";
import { existsSync, statSync } from "fs";

export const dynamic = 'force-dynamic';

/**
 * Nuclear Fix: Public media serving endpoint.
 *
 * WHY PUBLIC: When you send an image URL to WhatsApp (Meta Cloud API),
 * Meta's servers make an external HTTP request to fetch that image binary.
 * These server-to-server requests have NO cookies/auth headers.
 * Putting authentication here silently returns 401 to Meta, causing blank images.
 *
 * SECURITY: Files are stored at paths with UUID hashes (e.g., flow_a1b2c3d4_1710000000.png).
 * These paths are not guessable. We rely on a strict path traversal guard instead.
 */
export async function GET(
    req: Request,
    { params }: { params: { path: string[] } }
) {
    try {
        const relativePath = params.path.join('/');

        // SECURITY: Strict path traversal guard — only this matters since paths are UUID-hashed
        if (relativePath.includes('..') || relativePath.startsWith('/') || relativePath.includes('\0')) {
            return new Response("Forbidden", { status: 403 });
        }

        const rootDir = process.cwd();
        console.log(`[LocalMediaProxy] Request: ${relativePath} | CWD: ${rootDir}`);
        
        // Build exhaustive candidate paths - This is the "Monster Fix"
        const pathsToTry = [
            // 1. Direct match (e.g. if the user hit /api/media/local/uploads/...)
            join(rootDir, "public", relativePath),
            
            // 2. Smart "Uploads" match (e.g. vendor/xxx -> public/uploads/vendor/xxx)
            join(rootDir, "public", "uploads", relativePath.replace(/^uploads\/?/, '')),
            
            // 3. Smart "Uploads Old" match (fallback for legacy files)
            join(rootDir, "public", "uploads_old", relativePath.replace(/^uploads_old\/?/, '')),
            
            // 4. Absolute Fallback (handles edge cases where path is just the filename)
            join(rootDir, "public", "uploads", "general", relativePath),
            join(rootDir, "public", "uploads_old", "general", relativePath)
        ];

        let filePath = "";
        let found = false;

        for (const p of pathsToTry) {
            try {
                if (existsSync(p) && statSync(p).isFile()) {
                    filePath = p;
                    found = true;
                    console.log(`[LocalMediaProxy] ✅ MATCH: ${p}`);
                    break;
                }
            } catch (e) {
                // Ignore stat errors for missing directories
            }
        }

        if (!found) {
            console.error(`[LocalMediaProxy] 404 NOT FOUND: ${relativePath}`);
            return new Response("File not found", { status: 404 });
        }

        console.log(`[LocalMediaProxy] Serving: ${filePath}`);

        const buffer = await readFile(filePath);

        // MIME inference
        const extMatch = filePath.match(/\.([a-zA-Z0-9]+)$/);
        const ext = extMatch ? extMatch[1].toLowerCase() : '';
        const mimeMap: Record<string, string> = {
            'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png',
            'gif': 'image/gif', 'webp': 'image/webp', 'pdf': 'application/pdf',
            'svg': 'image/svg+xml',
            'mp4': 'video/mp4', 'mov': 'video/quicktime', '3gp': 'video/3gpp',
            'avi': 'video/x-msvideo',
            'csv': 'text/csv', 'mp3': 'audio/mpeg',
            'ogg': 'audio/ogg', 'aac': 'audio/aac', 'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        };
        const contentType = mimeMap[ext] || "application/octet-stream";

        return new Response(buffer, {
            headers: {
                "Content-Type": contentType,
                "Content-Length": buffer.length.toString(),
                "Accept-Ranges": "bytes",
                "Cache-Control": "public, max-age=86400",
            },
        });

    } catch (error: any) {
        console.error("[LocalMediaProxy] Error:", error.message);
        return new Response("Internal Server Error", { status: 500 });
    }
}

