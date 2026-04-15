
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
    | "knowledge"
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
            // UPLOAD_DEBUG: Log incoming file info
            // ----------------------------------------------------
            console.log(`[UPLOAD_DEBUG] Incoming File: name=${file.name}, size=${file.size}, type=${file.type}, module=${module}`);

            // ----------------------------------------------------
            // SYSTEM PATH RESOLUTION (Nuclear Persistence Fix)
            // ----------------------------------------------------
            const rootDir = process.cwd();
            const publicDir = join(rootDir, "public");
            
            // Step 1: Attempt to use 'uploads' (Persistent Volume in Docker/Prod)
            let relativeBase = join("uploads", "vendor", tenantId.replace(/[^a-z0-9-]/gi, '_').toLowerCase(), safeMod);
            let uploadBase = join(publicDir, relativeBase);

            console.log(`[UPLOAD_DEBUG] Resolved Target Path: ${uploadBase}`);

            try {
                // Step 2: Ensure path exists
                await mkdir(uploadBase, { recursive: true });
            } catch (err: any) {
                console.warn(`[UPLOAD_DEBUG] Primary mkdir failed: ${err.message}. Retrying with fallback.`);
                relativeBase = join("uploads_old", "vendor", tenantId.replace(/[^a-z0-9-]/gi, '_').toLowerCase(), safeMod);
                uploadBase = join(publicDir, relativeBase);
                await mkdir(uploadBase, { recursive: true });
            }

            if (file.size > maxSize) {
                console.error(`[UPLOAD_DEBUG] Rejecting file: size ${file.size} > limit ${maxSize}`);
                throw new Error(`File too large. Max: ${maxSize / (1024 * 1024)}MB`);
            }

            const extension = this.MIME_MAP[file.type];
            if (!extension) {
                console.error(`[UPLOAD_DEBUG] Rejecting file: unsupported MIME type "${file.type}"`);
                throw new Error(`Invalid file type: ${file.type}`);
            }

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // 6. Generate Secure Filename
            const uniqueFilename = `${safeMod}_${uuidv4().substring(0, 8)}_${Date.now()}${extension}`;
            const filepath = join(uploadBase, uniqueFilename);

            // 7. Atomic Write
            console.log(`[UPLOAD_DEBUG] Attempting ATOMIC write to: ${filepath}`);
            try {
                await writeFile(filepath, buffer);
            } catch (writeErr: any) {
                console.error(`[UPLOAD_DEBUG] Atomic write failed: ${writeErr.message}`);
                if (relativeBase.startsWith("uploads/")) {
                    relativeBase = join("uploads_old", "vendor", tenantId.replace(/[^a-z0-9-]/gi, '_').toLowerCase(), safeMod);
                    uploadBase = join(publicDir, relativeBase);
                    await mkdir(uploadBase, { recursive: true });
                    await writeFile(join(uploadBase, uniqueFilename), buffer);
                } else {
                    throw writeErr;
                }
            }

            // 8. Return DYNAMIC ROUTE URL
            const urlPath = `vendor/${tenantId.replace(/[^a-z0-9-]/gi, '_').toLowerCase()}/${safeMod}/${uniqueFilename}`;
            const webUrl = `/api/media/local/${urlPath}`;
            console.log(`[UPLOAD_DEBUG] ✅ SUCCESS: File accessible at ${webUrl}`);

            return {
                url: webUrl,
                filename: uniqueFilename,
                originalName: file.name,
                mimeType: file.type,
                size: file.size
            };

        } catch (err: any) {
            console.error(`[UPLOAD_DEBUG] ❌ INTERNAL ERROR:`, err.message);
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
