import { WhatsAppService } from "./service";
import { decrypt } from "../security/encryption";
import fs from "fs";
import path from "path";
import axios from "axios";
import { mkdir, writeFile } from "fs/promises";

export class MediaCachingService {
    private static CACHE_DIR = path.join(process.cwd(), "public", "uploads", "media_cache");

    /**
     * Downloads media from Meta if not already cached and returns the local URL.
     */
    static async getLocalUrl(mediaId: string, whatsappAccount: any, workspaceId: string): Promise<{ 
        url: string, 
        mime_type: string, 
        file_size: number, 
        file_name?: string 
    } | null> {
        try {
            // 1. Check if directory exists
            if (!fs.existsSync(this.CACHE_DIR)) {
                await mkdir(this.CACHE_DIR, { recursive: true });
            }

            // 2. Meta uses different extensions, we try to find it first
            // We search for any file starting with mediaId
            const existingFiles = fs.readdirSync(this.CACHE_DIR);
            const cachedFile = existingFiles.find(f => f.startsWith(mediaId));
            
            if (cachedFile) {
                const fullPath = path.join(this.CACHE_DIR, cachedFile);
                const stats = fs.statSync(fullPath);
                console.log(`[MediaCache] HIT: ${mediaId} -> ${cachedFile}`);
                
                // Infer mime from extension
                const ext = path.extname(cachedFile).toLowerCase().replace(".", "");
                const mime = this.getMimeFromExt(ext);

                return {
                    url: `/api/media/local/media_cache/${cachedFile}`,
                    mime_type: mime,
                    file_size: stats.size,
                    file_name: cachedFile
                };
            }

            // 3. MISS: Download from Meta
            console.log(`[MediaCache] MISS: Downloading ${mediaId} from Meta...`);
            const token = decrypt(whatsappAccount.access_token);
            
            // Step 3a: Get Meta Media URL
            const metaMetadata = await axios.get(`https://graph.facebook.com/v20.0/${mediaId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const { url: tempUrl, mime_type: mimeType, size, sha256 } = metaMetadata.data;
            const ext = this.getExtFromMime(mimeType);
            const fileName = `${mediaId}.${ext}`;
            const targetPath = path.join(this.CACHE_DIR, fileName);

            // Step 3b: Download binary using the temp URL
            const response = await axios.get(tempUrl, {
                headers: { 'Authorization': `Bearer ${token}` },
                responseType: 'arraybuffer'
            });

            await writeFile(targetPath, Buffer.from(response.data));
            console.log(`[MediaCache] SUCCESS: Stored ${fileName} (${size} bytes)`);

            return {
                url: `/api/media/local/media_cache/${fileName}`,
                mime_type: mimeType,
                file_size: size,
                file_name: fileName
            };

        } catch (error: any) {
            console.error(`[MediaCache] FAILED for ${mediaId}:`, error.response?.data || error.message);
            return null;
        }
    }

    private static getExtFromMime(mime: string): string {
        const map: Record<string, string> = {
            'image/jpeg': 'jpg',
            'image/png': 'png',
            'image/webp': 'webp',
            'image/heic': 'heic',
            'video/mp4': 'mp4',
            'video/quicktime': 'mov',
            'video/3gpp': '3gp',
            'video/x-msvideo': 'avi',
            'audio/mpeg': 'mp3',
            'audio/ogg': 'ogg',
            'audio/ogg; codecs=opus': 'ogg',
            'audio/aac': 'aac',
            'audio/mp4': 'm4a',
            'application/pdf': 'pdf',
            'application/msword': 'doc',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
            'application/vnd.ms-excel': 'xls',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
            'text/plain': 'txt'
        };
        return map[mime] || 'bin';
    }

    private static getMimeFromExt(ext: string): string {
        const map: Record<string, string> = {
            'jpg': 'image/jpeg', 'jpeg': 'image/jpeg',
            'png': 'image/png', 'webp': 'image/webp', 'heic': 'image/heic',
            'mp4': 'video/mp4', 'mov': 'video/quicktime',
            '3gp': 'video/3gpp', 'avi': 'video/x-msvideo',
            'mp3': 'audio/mpeg', 'ogg': 'audio/ogg',
            'aac': 'audio/aac', 'm4a': 'audio/mp4',
            'pdf': 'application/pdf', 'doc': 'application/msword',
            'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'xls': 'application/vnd.ms-excel',
            'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'txt': 'text/plain'
        };
        return map[ext] || 'application/octet-stream';
    }
}
