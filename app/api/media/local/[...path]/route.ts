import { join } from "path";
import { readFile, stat } from "fs/promises";

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
        const uploadDir = join(rootDir, "public", "uploads");
        const filePath = join(uploadDir, relativePath);

        // Ensure the resolved path is still inside the upload directory
        if (!filePath.startsWith(uploadDir)) {
            return new Response("Forbidden", { status: 403 });
        }

        try {
            const fileStat = await stat(filePath);
            if (!fileStat.isFile()) throw new Error("Not a file");
        } catch (e) {
            return new Response("File not found", { status: 404 });
        }

        const buffer = await readFile(filePath);

        // MIME inference
        const extMatch = filePath.match(/\.([a-zA-Z0-9]+)$/);
        const ext = extMatch ? extMatch[1].toLowerCase() : '';
        const mimeMap: Record<string, string> = {
            'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png',
            'gif': 'image/gif', 'webp': 'image/webp', 'pdf': 'application/pdf',
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

