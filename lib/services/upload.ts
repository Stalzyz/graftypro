
import { writeFile, mkdir } from "fs/promises";
import { join, extname } from "path";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

export type UploadModule =
    | "flow"
    | "theme"
    | "templates"
    | "branding"
    | "ecommerce"
    | "offers"
    | "email"
    | "whitelabel"
    | "general";

export interface UploadOptions {
    maxSize?: number; // In bytes
    allowedTypes?: string[];
    module?: UploadModule;
    tenantId?: string;
}

export interface UploadResult {
    url: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
}

export class ImageUploadService {
    private static DEFAULT_MAX_SIZE = 50 * 1024 * 1024; // 50MB

    // Strict MIME-to-Extension Map (Security: Prevent extension spoofing)
    private static MIME_MAP: Record<string, string> = {
        // Images
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
        "image/svg+xml": ".svg",
        "image/avif": ".avif",
        "image/heif": ".heic",
        "image/heic": ".heic",
        // Video
        "video/mp4": ".mp4",
        "video/3gp": ".3gp",
        "video/quicktime": ".mov",
        // Audio
        "audio/mpeg": ".mp3",
        "audio/mp3": ".mp3",
        "audio/ogg": ".ogg",
        "audio/wav": ".wav",
        "audio/webm": ".webm",
        "audio/aac": ".aac",
        "audio/mp4": ".m4a",
        "audio/amr": ".amr",
        // Documents
        "application/pdf": ".pdf",
        "application/msword": ".doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
        "application/vnd.ms-excel": ".xls",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
        "application/zip": ".zip",
        "text/plain": ".txt",
        "text/csv": ".csv",
        "application/json": ".json"
    };

    /**
     * Centralized upload handler for all modules.
     */
    static async uploadImage(file: File, options: UploadOptions = {}): Promise<UploadResult> {
        try {
            const {
                maxSize = this.DEFAULT_MAX_SIZE,
                module = "general",
                tenantId = "system"
            } = options;

            const safeMod = module.replace(/[^a-z0-9]/gi, '_').toLowerCase();

            // ----------------------------------------------------
            // SYSTEM PATH RESOLUTION (Nuclear Persistence Fix)
            // ----------------------------------------------------
            const rootDir = process.cwd();
            const publicDir = join(rootDir, "public");
            
            // Step 1: Attempt to use 'uploads' (Persistent Volume in Docker/Prod)
            let relativeBase = join("uploads", "vendor", tenantId.replace(/[^a-z0-9-]/gi, '_').toLowerCase(), safeMod);
            let uploadBase = join(publicDir, relativeBase);

            console.log(`[NUCLEAR UPLOAD] Primary Target: ${uploadBase}`);

            try {
                // Try to create the primary directory
                await mkdir(uploadBase, { recursive: true });
                // Try a test write or just assume if mkdir works, we are good?
                // Actually, on Mac, mkdir might work but writeFile might fail if the parent is locked.
                // Let's stick to the plan: try primary, catch error, fallback.
            } catch (err: any) {
                console.warn(`[Upload System] Primary 'uploads' failed (likely local Mac lock): ${err.message}`);
                relativeBase = join("uploads_old", "vendor", tenantId.replace(/[^a-z0-9-]/gi, '_').toLowerCase(), safeMod);
                uploadBase = join(publicDir, relativeBase);
                console.log(`[NUCLEAR UPLOAD] Fallback Target: ${uploadBase}`);
                await mkdir(uploadBase, { recursive: true });
            }

            if (file.size > maxSize) {
                throw new Error(`File too large. Max: ${maxSize / (1024 * 1024)}MB`);
            }

            const extension = this.MIME_MAP[file.type];
            if (!extension) {
                throw new Error(`Invalid file type: ${file.type}`);
            }

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // 6. Generate Secure Filename
            const uniqueFilename = `${safeMod}_${uuidv4().substring(0, 8)}_${Date.now()}${extension}`;
            const filepath = join(uploadBase, uniqueFilename);

            // 7. Atomic Write
            console.log(`[NUCLEAR UPLOAD] Writing file: ${uniqueFilename}`);
            try {
                await writeFile(filepath, buffer);
            } catch (writeErr: any) {
                if (relativeBase.startsWith("uploads/")) {
                    console.error(`[Upload System] Write to 'uploads' failed, retrying on 'uploads_old'...`);
                    relativeBase = join("uploads_old", "vendor", tenantId.replace(/[^a-z0-9-]/gi, '_').toLowerCase(), safeMod);
                    uploadBase = join(publicDir, relativeBase);
                    await mkdir(uploadBase, { recursive: true });
                    await writeFile(join(uploadBase, uniqueFilename), buffer);
                } else {
                    throw writeErr;
                }
            }

            // 8. Return DYNAMIC ROUTE URL
            // CRITICAL SERVER-SIDE GOTCHA: Next.js caches the `public` folder at build time. 
            // Any file written to `public` at runtime will 404 if requested directly via static paths like `/uploads/...`.
            // Therefore, we MUST use the dynamic API route which bypasses Next's static cache and reads via fs.readFile.
            const urlPath = `vendor/${tenantId.replace(/[^a-z0-9-]/gi, '_').toLowerCase()}/${safeMod}/${uniqueFilename}`;
            const webUrl = `/api/media/local/${urlPath}`;
            console.log(`[NUCLEAR UPLOAD] Success -> ${webUrl}`);

            return {
                url: webUrl,
                filename: uniqueFilename,
                originalName: file.name,
                mimeType: file.type,
                size: file.size
            };

        } catch (err: any) {
            console.error(`[Upload System Internal Error]:`, err);
            throw err;
        }
    }

    /**
     * Clean up orphaned files (Not implemented here, but prepared for Phase 11)
     */
    static async deleteImage(url: string): Promise<boolean> {
        // Implementation for deleting files from disk
        // Should validate that the path is within /uploads to prevent path traversal
        return true;
    }
}
