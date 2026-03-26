
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCurrentUser } from "../../../../../lib/auth";
import { WhatsAppService } from "../../../../../lib/whatsapp/service";
import { decrypt } from "../../../../../lib/security/encryption";
import { getAbsoluteMediaUrl } from "../../../../../lib/utils/url";
import { readFileSync, existsSync, statSync } from "fs";
import { join } from "path";

export const dynamic = 'force-dynamic';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const limit = Number(searchParams.get("limit") || "500");

        const messages = await prisma.message.findMany({
            where: {
                conversation_id: params.id,
                workspace_id: user.workspaceId
            },
            take: limit,
            orderBy: { created_at: "asc" }
        });

        // Mark messages as read if they were inbound
        await prisma.message.updateMany({
            where: {
                conversation_id: params.id,
                direction: "INBOUND",
                status: { not: "READ" }
            },
            data: { status: "READ" }
        });

        return NextResponse.json({ data: messages });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { text, mediaUrl, mediaType, filename, templateName, langCode } = await req.json();

        const conversation = await prisma.conversation.findUnique({
            where: { id: params.id },
            include: {
                contact: true,
                workspace: { include: { waba: true } }
            }
        });

        if (!conversation || conversation.workspace_id !== user.workspaceId) {
            return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
        }

        const waba = conversation.workspace.waba;
        if (!waba) return NextResponse.json({ error: "WhatsApp account not found" }, { status: 400 });

        const token = decrypt(waba.access_token);
        let response: any;
        let type: string = "TEXT";
        let content: any = { body: text };

        const category = templateName ? "MARKETING" : "SERVICE";

        if (templateName) {
            response = await WhatsAppService.sendTemplate(
                waba.phone_number_id, 
                token, 
                conversation.contact.phone, 
                templateName, 
                langCode || "en",
                [],
                user.workspaceId,
                category,
                "Manual Console Reply"
            );
            type = "TEMPLATE";
            content = { template_name: templateName, lang: langCode || "en" };
        } else if (mediaUrl) {
            const absoluteMediaUrl = getAbsoluteMediaUrl(mediaUrl, req);
            console.log(`[WA_SEND] Media detected: ${mediaUrl}`);

            let mediaId: string | null = null;
            try {
                if (mediaUrl.includes("/api/media/local/") || mediaUrl.startsWith("/uploads/") || mediaUrl.startsWith("/uploads_old/")) {
                    let relativePath = "";
                    if (mediaUrl.includes("/api/media/local/")) {
                        relativePath = mediaUrl.split("/api/media/local/")[1];
                    } else {
                        relativePath = mediaUrl.substring(1);
                    }

                    const rootDir = process.cwd();
                    const pathsToTry = [
                        join(rootDir, "public", relativePath),
                        join(rootDir, "public", "uploads", relativePath.replace(/^uploads\//, '')),
                        join(rootDir, "public", "uploads_old", relativePath.replace(/^uploads_old\//, ''))
                    ];

                    let foundPath = "";
                    for (const p of pathsToTry) {
                        if (existsSync(p)) {
                            foundPath = p;
                            break;
                        }
                    }

            // ─── MEDIA PRE-UPLOAD PHASE ───
            if (foundPath) {
                const stats = statSync(foundPath);
                const fileSizeMB = stats.size / (1024 * 1024);
                console.log(`[WA_SEND] Disk Read: ${foundPath} (${fileSizeMB.toFixed(2)} MB)`);
                
                // STEP 4: STRICT VALIDATION
                if (mediaType === "VIDEO") {
                    if (fileSizeMB > 16) {
                        return NextResponse.json({ error: `Video file too large (${fileSizeMB.toFixed(2)}MB). Max allowed is 16MB.` }, { status: 400 });
                    }
                    const ext = (filename || foundPath).split('.').pop()?.toLowerCase() || '';
                    if (!['mp4', '3gp', 'mov'].includes(ext)) {
                        return NextResponse.json({ error: `Invalid video format (.${ext}). Only .mp4 and .3gp are officially supported.` }, { status: 400 });
                    }
                }

                const buffer = readFileSync(foundPath);
                
                // Infer MIME from filename extension
                let mime = "application/octet-stream";
                const ext = (filename || foundPath).split('.').pop()?.toLowerCase() || '';
                const mimeMap: Record<string, string> = {
                    'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'webp': 'image/webp', 'gif': 'image/gif',
                    'mp4': 'video/mp4', 'mov': 'video/quicktime', '3gp': 'video/3gpp', 'avi': 'video/x-msvideo',
                    'mp3': 'audio/mpeg', 'ogg': 'audio/ogg', 'aac': 'audio/aac',
                    'pdf': 'application/pdf', 'doc': 'application/msword',
                    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                };
                if (mimeMap[ext]) mime = mimeMap[ext];
                else if (mediaType === "IMAGE") mime = "image/jpeg";
                else if (mediaType === "VIDEO") mime = "video/mp4";
                else if (mediaType === "AUDIO") mime = "audio/mpeg";
                else if (mediaType === "DOCUMENT") mime = "application/pdf";
                
                // STEP 1 & 5: UPLOAD WITH DETAILED ERROR LOGGING
                mediaId = await WhatsAppService.uploadMediaFromBuffer(
                    buffer, 
                    mime, 
                    filename || `attachment.${ext || 'bin'}`, 
                    waba.phone_number_id, 
                    token
                );
            }
        }

        if (!mediaId) {
            mediaId = await WhatsAppService.uploadMediaFromUrl(absoluteMediaUrl, waba.phone_number_id, token);
        }
    } catch (err: any) {
        console.error(`[WA_SEND] Pre-upload Critical Failure:`, err.message);
    }

    // ─── TRANSMISSION LOGIC (STEP 3 & 5) ──────────────
    try {
        if (mediaType === "IMAGE") {
            const payload = mediaId ? { to: conversation.contact.phone, type: "image", image: { id: mediaId, caption: text } } : { to: conversation.contact.phone, type: "image", image: { link: absoluteMediaUrl, caption: text } };
            response = await WhatsAppService.sendMessage(waba.phone_number_id, token, payload, user.workspaceId, category, "Manual Media");
            type = "IMAGE";
            content = { link: mediaUrl, caption: text };
        } else if (mediaType === "VIDEO") {
            try {
                // STEP 3: CORRECT PAYLOAD STRUCTURE
                const payload = mediaId 
                    ? { to: conversation.contact.phone, type: "video", video: { id: mediaId, caption: text } } 
                    : { to: conversation.contact.phone, type: "video", video: { link: absoluteMediaUrl, caption: text } };
                
                console.log(`[WA_SEND] Sending VIDEO via ${mediaId ? 'Media-ID' : 'Link'}...`);
                response = await WhatsAppService.sendMessage(waba.phone_number_id, token, payload, user.workspaceId, category, `Manual Video (${mediaId ? 'ID' : 'Link'})`);
            } catch (videoError: any) {
                console.error(`[WA_SEND] ⚠️ Video transmission failed:`, videoError.message);
                
                // FALLBACK ONLY IF ID FAILED
                if (mediaId) {
                    console.log(`[WA_SEND] 🔄 Retrying VIDEO with Link Fallback...`);
                    const fallbackPayload = { to: conversation.contact.phone, type: "video", video: { link: absoluteMediaUrl, caption: text } };
                    response = await WhatsAppService.sendMessage(waba.phone_number_id, token, fallbackPayload, user.workspaceId, category, "Manual Video (Link Fallback)");
                } else {
                    throw videoError;
                }
            }
            type = "VIDEO";
            content = { link: mediaUrl, caption: text };
        } else if (mediaType === "AUDIO") {
            const payload = mediaId ? { to: conversation.contact.phone, type: "audio", audio: { id: mediaId } } : { to: conversation.contact.phone, type: "audio", audio: { link: absoluteMediaUrl } };
            response = await WhatsAppService.sendMessage(waba.phone_number_id, token, payload, user.workspaceId, category, "Manual Media");
            type = "AUDIO";
            content = { link: mediaUrl };
        } else {
            const payload = mediaId ? { to: conversation.contact.phone, type: "document", document: { id: mediaId, filename: filename || "document" } } : { to: conversation.contact.phone, type: "document", document: { link: absoluteMediaUrl, filename: filename || "document.pdf" } };
            response = await WhatsAppService.sendMessage(waba.phone_number_id, token, payload, user.workspaceId, category, "Manual Media");
            type = "DOCUMENT";
            content = { link: mediaUrl, filename: filename || "document.pdf", caption: text };
        }
    } catch (sendError: any) {
        console.error(`[WA_SEND] Final transmission failure:`, sendError.message);
        throw sendError;
    }
} else {
    if (!text) return NextResponse.json({ error: "Text is required" }, { status: 400 });
    response = await WhatsAppService.sendText(waba.phone_number_id, token, conversation.contact.phone, text, user.workspaceId, category, "Manual Reply");
}

        const metaId = response?.messages?.[0]?.id;

        // Auto-close active sessions
        try {
            await prisma.flowSession.updateMany({
                where: { contact_id: conversation.contact_id, is_completed: false },
                data: { is_completed: true, state: { closed_reason: "HUMAN_INTERVENTION" } as any }
            });
        } catch {}

        // Normalize media_url to the canonical proxy path so the UI can always resolve it
        const normalizedMediaUrl = mediaUrl
            ? (mediaUrl.startsWith('/api/media/local/') ? mediaUrl
                : mediaUrl.startsWith('/uploads/') ? `/api/media/local/${mediaUrl.substring(1)}`
                : mediaUrl.startsWith('/uploads_old/') ? `/api/media/local/${mediaUrl.substring(1)}`
                : mediaUrl)
            : null;

        // 🎯 PRODUCTION METADATA PERSISTENCE
        const message = await prisma.message.create({
            data: {
                workspace_id: user.workspaceId,
                contact_id: conversation.contact_id,
                conversation_id: conversation.id,
                meta_id: metaId || `manual_${Date.now()}`,
                type: type as any,
                direction: "OUTBOUND",
                content: content,
                status: "SENT",
                media_url: normalizedMediaUrl,
                mime_type: (mediaType === "IMAGE" ? "image/jpeg" : mediaType === "VIDEO" ? "video/mp4" : mediaType === "AUDIO" ? "audio/mpeg" : mediaUrl ? "application/pdf" : null),
                file_name: filename || null,
                caption: text || null
            }
        });

        await prisma.conversation.update({
            where: { id: conversation.id },
            data: { updated_at: new Date() }
        });

        return NextResponse.json({ success: true, data: message });

    } catch (error: any) {
        console.error("Send Message Error:", error);
        return NextResponse.json({ error: error.message || "Failed to send message" }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        await prisma.message.deleteMany({ where: { conversation_id: params.id, workspace_id: user.workspaceId } });
        return NextResponse.json({ success: true, message: "Conversation cleared" });
    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
