
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCurrentUser } from "../../../../../lib/auth";
import { WhatsAppService } from "../../../../../lib/whatsapp/service";
import { decrypt } from "../../../../../lib/security/encryption";
import { getAbsoluteMediaUrl } from "../../../../../lib/utils/url";
import { readFileSync, existsSync } from "fs";
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



        // Send the message first (delivery is never blocked by billing)
        const category = templateName ? "MARKETING" : "SERVICE";

        if (templateName) {
            // Template message
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
            // NUCLEAR FIX: Pre-upload media to Meta → get media_id → use id (not link).
            // We read DIRECTLY FROM DISK to bypass network/auth/404 issues.
            const absoluteMediaUrl = getAbsoluteMediaUrl(mediaUrl, req);
            console.log(`[WA_SEND] Media detected. Source: ${mediaUrl}`);

            let mediaId: string | null = null;
            try {
                if (mediaUrl.includes("/api/media/local/") || mediaUrl.startsWith("/uploads/") || mediaUrl.startsWith("/uploads_old/")) {
                    // Handle both legacy /api/media/local/ paths and new static /uploads/ or /uploads_old/ paths
                    let relativePath = "";
                    if (mediaUrl.includes("/api/media/local/")) {
                        relativePath = mediaUrl.split("/api/media/local/")[1];
                    } else if (mediaUrl.startsWith("/uploads/")) {
                        relativePath = mediaUrl.substring(1); // removes leading slash
                    } else if (mediaUrl.startsWith("/uploads_old/")) {
                        relativePath = mediaUrl.substring(1);
                    }

                    if (relativePath) {
                        const rootDir = process.cwd();
                        const pathsToTry = [
                            join(rootDir, "public", relativePath), // Direct try if relativePath includes 'uploads/'
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

                        if (foundPath) {
                            console.log(`[WA_SEND] Nuclear Disk Read: ${foundPath}`);
                            const buffer = readFileSync(foundPath);
                        // Map mediaType to a friendly name for Meta
                        const mime = mediaType === "IMAGE" ? "image/jpeg" : 
                                     mediaType === "VIDEO" ? "video/mp4" : 
                                     mediaType === "AUDIO" ? "audio/mpeg" : "application/pdf";
                        
                        mediaId = await WhatsAppService.uploadMediaFromBuffer(
                            buffer, 
                            mime, 
                            filename || "attachment", 
                            waba.phone_number_id, 
                            token
                        );
                        }
                    }
                }

                // Fallback to URL-based sync if not found on disk or not a local file
                if (!mediaId) {
                    console.log(`[WA_SEND] Remote/Fallback sync via URL: ${absoluteMediaUrl}`);
                    mediaId = await WhatsAppService.uploadMediaFromUrl(absoluteMediaUrl, waba.phone_number_id, token);
                }
            } catch (uploadErr: any) {
                console.error(`[WA_SEND] Pre-upload failed:`, uploadErr.message, '— falling back to link.');
            }

            if (mediaType === "IMAGE") {
                const imagePayload = mediaId
                    ? { to: conversation.contact.phone, type: "image", image: { id: mediaId, caption: text } }
                    : { to: conversation.contact.phone, type: "image", image: { link: absoluteMediaUrl, caption: text } };
                response = await WhatsAppService.sendMessage(waba.phone_number_id, token, imagePayload, user.workspaceId, category, "Manual Media Message");
                type = "IMAGE";
                content = { link: mediaUrl, caption: text };
            } else if (mediaType === "VIDEO") {
                const videoPayload = mediaId
                    ? { to: conversation.contact.phone, type: "video", video: { id: mediaId, caption: text } }
                    : { to: conversation.contact.phone, type: "video", video: { link: absoluteMediaUrl, caption: text } };
                response = await WhatsAppService.sendMessage(waba.phone_number_id, token, videoPayload, user.workspaceId, category, "Manual Media Message");
                type = "VIDEO";
                content = { link: mediaUrl, caption: text };
            } else if (mediaType === "AUDIO") {
                const audioPayload = mediaId
                    ? { to: conversation.contact.phone, type: "audio", audio: { id: mediaId } }
                    : { to: conversation.contact.phone, type: "audio", audio: { link: absoluteMediaUrl } };
                response = await WhatsAppService.sendMessage(waba.phone_number_id, token, audioPayload, user.workspaceId, category, "Manual Media Message");
                type = "AUDIO";
                content = { link: mediaUrl };
            } else {
                // DOCUMENT default
                const docPayload = mediaId
                    ? { to: conversation.contact.phone, type: "document", document: { id: mediaId, filename: filename || "document" } }
                    : { to: conversation.contact.phone, type: "document", document: { link: absoluteMediaUrl, filename: filename || "document.pdf" } };
                response = await WhatsAppService.sendMessage(waba.phone_number_id, token, docPayload, user.workspaceId, category, "Manual Media Message");
                type = "DOCUMENT";
                content = { link: mediaUrl, filename: filename || "document.pdf", caption: text };
            }
        } else {
            if (!text) return NextResponse.json({ error: "Text is required" }, { status: 400 });
            response = await WhatsAppService.sendText(
                waba.phone_number_id, 
                token, 
                conversation.contact.phone, 
                text,
                user.workspaceId,
                category,
                "Manual Console Reply"
            );
        }

        const metaId = response?.messages?.[0]?.id;

        // Human Intervention: Close any active flow sessions
        try {
            await prisma.flowSession.updateMany({
                where: { contact_id: conversation.contact_id, is_completed: false },
                data: {
                    is_completed: true,
                    state: { closed_reason: "HUMAN_INTERVENTION" } as any
                }
            });
            console.log(`[FlowEngine] 🔒 Session closed due to human intervention for contact ${conversation.contact_id}`);
        } catch (e) {
            console.error("Failed to close flow session:", e);
        }

        // 2. Save Outbound Message
        const message = await prisma.message.create({
            data: {
                workspace_id: user.workspaceId,
                contact_id: conversation.contact_id,
                conversation_id: conversation.id,
                meta_id: metaId || `manual_${Date.now()}`,
                type: type as any,
                direction: "OUTBOUND",
                content: content,
                status: "SENT"
            }
        });

        // Update conversation last active
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

        await prisma.message.deleteMany({
            where: {
                conversation_id: params.id,
                workspace_id: user.workspaceId
            }
        });

        return NextResponse.json({ success: true, message: "Conversation cleared" });
    } catch (error) {
        console.error("Clear Conversation Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
