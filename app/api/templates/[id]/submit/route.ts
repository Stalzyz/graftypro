
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

        // 2. Submit to Meta
        const token = decrypt(waba.access_token);
        const metaResult = await MetaTemplateService.submitTemplate(
            waba.waba_id,
            token,
            template
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
