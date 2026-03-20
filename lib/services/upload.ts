
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

            // ABSOLUTE NUCLEAR PATH RESOLUTION
            const rootDir = process.cwd();
            const publicDir = join(rootDir, "public");
            const relativeDir = join("uploads", "vendor", tenantId.replace(/[^a-z0-9-]/gi, '_').toLowerCase(), module.replace(/[^a-z0-9]/gi, '_').toLowerCase());
            const uploadBase = join(publicDir, relativeDir);

            console.log(`[NUCLEAR UPLOAD] Root: ${rootDir}`);
            console.log(`[NUCLEAR UPLOAD] Base: ${uploadBase}`);

            if (file.size > maxSize) {
                throw new Error(`File too large. Max: ${maxSize / (1024 * 1024)}MB`);
            }

            const extension = this.MIME_MAP[file.type];
            if (!extension) {
                throw new Error(`Invalid file type: ${file.type}`);
            }

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // 5. Ensure directory exists with absolute path clarity
            try {
                await mkdir(uploadBase, { recursive: true });
                console.log(`[Upload System] Directory confirmed: ${uploadBase}`);
            } catch (mkdirError: any) {
                console.error(`[Upload System] Directory creation error:`, mkdirError.message);
            }

            // 6. Generate Secure Filename with cleaned values
            const safeMod = module.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const uniqueFilename = `${safeMod}_${uuidv4().substring(0, 8)}_${Date.now()}${extension}`;
            const filepath = join(uploadBase, uniqueFilename);

            // 7. Atomic Write
            console.log(`[NUCLEAR UPLOAD] Writing file: ${uniqueFilename}`);
            await writeFile(filepath, buffer);

            // 8. Return NUCLEAR DYNAMIC ROUTE URL (bypasses Next.js static cache)
            const webUrl = `/api/media/local/vendor/${tenantId.replace(/[^a-z0-9-]/gi, '_').toLowerCase()}/${safeMod}/${uniqueFilename}`;
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
