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
        
        // NUCLEAR FIX: Check BOTH 'uploads' and 'uploads_old' to handle legacy and provenance-locked paths
        const pathsToTry = [
            join(rootDir, "public", "uploads", relativePath),
            join(rootDir, "public", "uploads_old", relativePath),
            join(rootDir, "public", relativePath), // Fallback if path already includes 'uploads/'
        ];

        let filePath = "";
        let found = false;

        for (const p of pathsToTry) {
            const exists = existsSync(p);
            console.log(`[LocalMediaProxy] Trying: ${p} -> ${exists ? 'FOUND' : 'MISSING'}`);
            if (exists) {
                const fileStat = statSync(p);
                if (fileStat.isFile()) {
                    filePath = p;
                    found = true;
                    break;
                }
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
            'mp4': 'video/mp4', 'csv': 'text/csv', 'mp3': 'audio/mpeg',
            'ogg': 'audio/ogg', 'aac': 'audio/aac', 'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        };
        const contentType = mimeMap[ext] || "application/octet-stream";

        return new Response(buffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=86400",
            },
        });

    } catch (error: any) {
        console.error("[LocalMediaProxy] Error:", error.message);
        return new Response("Internal Server Error", { status: 500 });
    }
}

