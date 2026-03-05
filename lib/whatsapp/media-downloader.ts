
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
            const webUrl = `/${relativeDir}/${filename}`.replace(/\\/g, '/');

            // 4. Save file
            await writeFile(absolutePath, buffer);
            console.log(`[MediaDownloader] Saved ${mediaId} to ${webUrl}`);

            return webUrl;
        } catch (error) {
            console.error(`[MediaDownloader] Error for media ${mediaId}:`, error);
            return null;
        }
    }

    private static getExtensionForMime(mime: string): string {
        const map: Record<string, string> = {
            "image/jpeg": ".jpg",
            "image/png": ".png",
            "image/webp": ".webp",
            "image/gif": ".gif",
            "video/mp4": ".mp4",
            "audio/mpeg": ".mp3",
            "audio/ogg": ".ogg",
            "audio/amr": ".amr",
            "application/pdf": ".pdf",
            "text/plain": ".txt"
        };
        return map[mime] || ".bin";
    }
}
