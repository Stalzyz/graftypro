
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { WhatsAppService } from "./service";

export class WhatsAppMediaDownloader {
    /**
     * Downloads media from WhatsApp/Meta and saves it locally
     * Returns the relative public URL
     */
    static async downloadAndSaveMedia(mediaId: string, token: string, workspaceId: string): Promise<string | null> {
        try {
            // 1. Get Media URL
            const details = await WhatsAppService.getMediaDetails(mediaId, token);
            if (!details.url) return null;

            // 2. Download binary
            const { buffer, contentType } = await WhatsAppService.downloadMediaBinary(details.url, token);

            // 3. Prepare storage
            const extension = this.getExtensionForMime(contentType);
            const filename = `wa_media_${mediaId}_${Date.now()}${extension}`;

            const rootDir = process.cwd();
            const relativeDir = join("uploads", "whatsapp", workspaceId.replace(/[^a-z0-9-]/gi, '_').toLowerCase());
            const absoluteDir = join(rootDir, "public", relativeDir);

            console.log(`[MediaDownloader] 📁 Preparing directory: ${absoluteDir}`);
            await mkdir(absoluteDir, { recursive: true });

            const absolutePath = join(absoluteDir, filename);
            // 5. Generate Response URL (Absolute Web Path)
            const webUrl = `/uploads/whatsapp/${relativeDir.split('/').pop()}/${filename}`; // Adjusted to use existing variables
            console.log(`[MediaDownloader] ✅ Saved: ${absolutePath} -> ${webUrl}`); // Adjusted to use existing variables

            // 4. Save file
            await writeFile(absolutePath, buffer);
            // console.log(`[MediaDownloader] Saved ${mediaId} to ${webUrl}`); // Original line removed

            return webUrl;
        } catch (error) {
            console.error(`[MediaDownloader] Error for media ${mediaId}:`, error);
            return null;
        }
    }

    private static getExtensionForMime(mime: string): string {
        const map: Record<string, string> = {
            "image/jpeg": ".jpg",
            "image/jpg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
            "image/gif": ".gif",
            "image/heic": ".heic",
            "image/heif": ".heic",
            "image/avif": ".avif",
            "image/bmp": ".bmp",
            "image/tiff": ".tiff",
            "video/mp4": ".mp4",
            "video/3gpp": ".3gp",
            "video/quicktime": ".mov",
            "video/mpeg": ".mpeg",
            "audio/mpeg": ".mp3",
            "audio/mp3": ".mp3",
            "audio/ogg": ".ogg",
            "audio/amr": ".amr",
            "audio/mp4": ".m4a",
            "audio/aac": ".aac",
            "audio/opus": ".opus",
            "audio/wav": ".wav",
            "audio/webm": ".weba",
            "application/pdf": ".pdf",
            "text/plain": ".txt",
            "text/csv": ".csv",
            "application/msword": ".doc",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
            "application/vnd.ms-excel": ".xls",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
            "application/zip": ".zip"
        };
        return map[mime] || ".bin";
    }
}
