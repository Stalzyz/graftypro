
import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCurrentUser } from "../../../../../lib/auth";
import { MetaTemplateService } from "../../../../../lib/whatsapp/templates";
import { decrypt } from "../../../../../lib/security/encryption";

export const dynamic = "force-dynamic";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 1. Fetch Template with dependencies
        const template = await prisma.template.findUnique({
            where: { id: params.id },
            include: {
                variables: true,
                workspace: {
                    include: { waba: true }
                }
            }
        });

        if (!template || template.workspace_id !== user.workspaceId) {
            return NextResponse.json({ error: "Template not found" }, { status: 404 });
        }

        const waba = template.workspace.waba;
        if (!waba || !waba.waba_id || !waba.access_token) {
            return NextResponse.json({ error: "WhatsApp Business Account not connected" }, { status: 400 });
        }

        const token = decrypt(waba.access_token);
        // --- NUCLEAR FIX: Pre-upload local media to Meta ---
        let mediaHandle: string | undefined;
        let carouselMediaHandles: string[] = []; // Stores media_handle for each card

        const headerComponent = (template.components as any[])?.find(c => c.type === 'HEADER');
        const carouselComponent = (template.components as any[])?.find(c => c.type === 'CAROUSEL');

        const { join } = await import("path");
        const { readFile } = await import("fs/promises");
        const appId = waba.app_id || process.env.META_APP_ID || "1183066783900270"; // Fallback to platform's official App ID

        const uploadMedia = async (url: string, filename: string) => {
            if (!url.includes('/api/media/local/')) return undefined;
            const relativePath = url.split('/api/media/local/')[1];
            const filePath = join(process.cwd(), "public", "uploads", relativePath);
            console.log(`[NUCLEAR_SUBMIT] Attempting pre-upload for: ${filePath}`);
            const buffer = await readFile(filePath);
            const ext = filePath.split('.').pop()?.toLowerCase();
            const mimeMap: any = { 'jpg': 'image/jpeg', 'jpeg': 'image/jpeg', 'png': 'image/png', 'mp4': 'video/mp4', 'pdf': 'application/pdf' };
            const mimeType = mimeMap[ext!] || "application/octet-stream";
            return await MetaTemplateService.uploadMediaToMeta(appId, token, buffer, mimeType, filename);
        };

        if (headerComponent && ['IMAGE', 'VIDEO', 'DOCUMENT'].includes(headerComponent.format) && headerComponent.media_url) {
            try {
                mediaHandle = await uploadMedia(headerComponent.media_url, headerComponent.media_url.split('/').pop() || "media_header");
            } catch (uploadErr: any) {
                console.warn("[NUCLEAR_SUBMIT] Pre-upload failed, falling back to URL method:", uploadErr.message);
            }
        } else if (carouselComponent && carouselComponent.cards) {
            // Process CAROUSEL cards
            for (let i = 0; i < carouselComponent.cards.length; i++) {
                const card = carouselComponent.cards[i];
                const cardHeader = card.components?.find((c: any) => c.type === 'HEADER');
                if (cardHeader && ['IMAGE', 'VIDEO'].includes(cardHeader.format) && cardHeader.media_url) {
                    try {
                        const handle = await uploadMedia(cardHeader.media_url, `card_${i}_media`);
                        carouselMediaHandles.push(handle || "");
                    } catch (e: any) {
                        console.warn(`[NUCLEAR_SUBMIT] Pre-upload failed for card ${i}:`, e.message);
                        carouselMediaHandles.push("");
                    }
                } else {
                    carouselMediaHandles.push("");
                }
            }
        }

        // 2. Submit to Meta
        const metaResult = await MetaTemplateService.submitTemplate(
            waba.waba_id,
            token,
            template,
            mediaHandle,
            carouselMediaHandles
        );

        // 3. Update DB Status
        await prisma.template.update({
            where: { id: params.id },
            data: {
                status: "PENDING", // Wait for approval
                meta_id: metaResult.id
            }
        });

        return NextResponse.json({
            success: true,
            status: "PENDING",
            meta_id: metaResult.id
        });

    } catch (error: any) {
        console.error("Submission Failure", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
