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

        const template = await prisma.template.findUnique({
            where: { id: params.id },
            include: {
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

        // Fetch status from Meta
        const metaStatus = await MetaTemplateService.getTemplateStatus(
            waba.waba_id,
            token,
            template.name
        );

        if (!metaStatus) {
            return NextResponse.json({ error: "Could not fetch status from Meta or template not found there" }, { status: 400 });
        }

        // Update DB Status if it changed
        if (metaStatus !== template.status) {
            await prisma.template.update({
                where: { id: params.id },
                data: { status: metaStatus }
            });
        }

        return NextResponse.json({
            success: true,
            status: metaStatus
        });

    } catch (error: any) {
        console.error("Refresh Status Failure", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
