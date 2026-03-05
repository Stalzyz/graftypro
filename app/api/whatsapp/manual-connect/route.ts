import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";
import { WhatsAppService } from "../../../../lib/whatsapp/service";
import { encrypt } from "../../../../lib/security/encryption";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { phoneNumberId, wabaId, accessToken } = await req.json();

        if (!phoneNumberId || !wabaId || !accessToken) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Validate Credentials via Engine (Phase 4, Step 3)
        const validation = await WhatsAppService.validateCredentials(phoneNumberId, accessToken);

        if (!validation.success) {
            return NextResponse.json({ error: validation.error }, { status: 422 });
        }

        // 2. Save to Database (Phase 4, Step 1 & 2)
        const encryptedToken = encrypt(accessToken);

        // De-conflict: If this phone is already registered to another workspace, remove it
        await prisma.whatsAppAccount.deleteMany({
            where: {
                phone_number_id: phoneNumberId,
                workspace_id: { not: user.workspaceId }
            }
        });

        const account = await prisma.whatsAppAccount.upsert({
            where: { workspace_id: user.workspaceId },
            update: {
                phone_number_id: phoneNumberId,
                waba_id: wabaId,
                access_token: encryptedToken,
                phone_number: validation.data?.phoneNumber || "unknown",
                display_name: validation.data?.verifiedName || "WhatsApp Account",
                status: "CONNECTED",
                integration_status: "ACTIVE",
                health_status: "HEALTHY",
                validated_at: new Date()
            },
            create: {
                workspace_id: user.workspaceId,
                phone_number_id: phoneNumberId,
                waba_id: wabaId,
                access_token: encryptedToken,
                phone_number: validation.data?.phoneNumber || "unknown",
                display_name: validation.data?.verifiedName || "WhatsApp Account",
                status: "CONNECTED",
                integration_status: "ACTIVE",
                health_status: "HEALTHY",
                validated_at: new Date()
            }
        });

        // 3. Audit Log (Phase 6 Early)
        await prisma.integrationAuditLog.create({
            data: {
                whatsapp_account_id: account.id,
                workspace_id: user.workspaceId,
                action: "VALIDATION_PASSED",
                details: { method: "manual" }
            }
        });

        return NextResponse.json({
            success: true,
            message: "WhatsApp Integration activated successfully",
            data: validation.data
        });

    } catch (error: any) {
        console.error("Manual Integration Error:", error);
        return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
    }
}
