import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCurrentUser } from "../../../../../lib/auth";
import { WhatsAppService } from "../../../../../lib/whatsapp/service";
import { decrypt } from "../../../../../lib/security/encryption";

export const dynamic = 'force-dynamic';

/**
 * Meta Media Proxy API
 * Converts a Meta media_id into a viewable binary stream.
 * This is required because Meta Media URLs are temporary and require Authorization headers.
 */
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        let mediaId = params.id;
        
        // Monster Fix: If ID is a filename (wa_media_ID_TIMESTAMP.ext), extract just the ID
        if (mediaId.startsWith("wa_media_")) {
            const parts = mediaId.split("_");
            if (parts.length >= 3) {
                mediaId = parts[2]; // Extracts the ID from wa_media_{ID}_{TIMESTAMP}
                console.log(`[MediaProxy] Extracted ID ${mediaId} from filename ${params.id}`);
            }
        }

        const user = await getCurrentUser(req);
        
        if (!user) {
            return new Response("Unauthorized", { status: 401 });
        }

        // Get the WhatsApp account for this workspace
        const account = await prisma.whatsAppAccount.findFirst({
            where: { workspace_id: user.workspaceId }
        });

        if (!account || !account.access_token) {
            return new Response("WhatsApp account not configured", { status: 404 });
        }

        const token = decrypt(account.access_token);

        // 1. Get Media Details (to find the temporary URL)
        console.log(`[MediaProxy] Fetching details for ID: ${mediaId}...`);
        const details = await WhatsAppService.getMediaDetails(mediaId, token);
        
        if (!details.url) {
            return new Response("Media URL not found in Meta response", { status: 404 });
        }

        // 2. Download the binary data
        console.log(`[MediaProxy] Downloading binary from Meta...`);
        const { buffer, contentType } = await WhatsAppService.downloadMediaBinary(details.url, token);

        // 3. Return the stream with appropriate headers
        return new Response(buffer, {
            headers: {
                "Content-Type": contentType || "image/jpeg",
                "Cache-Control": "public, max-age=3600", // Cache for 1 hour
            },
        });

    } catch (error: any) {
        console.error("[MediaProxy] Error:", error.response?.data || error.message);
        return new Response("Failed to fetch media from Meta", { status: 500 });
    }
}
