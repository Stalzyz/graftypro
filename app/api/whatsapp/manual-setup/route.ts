import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { WhatsAppService } from "@/lib/whatsapp/service";
import { encrypt } from "@/lib/security/encryption";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { wabaId, phoneNumberId, appId, appSecret, accessToken } = body;

        // Basic validation
        if (!wabaId || !phoneNumberId || !appId || !appSecret || !accessToken) {
            return NextResponse.json({ error: "Missing required credentials" }, { status: 400 });
        }

        // 1. Validate Credentials with Meta (PHASE 3)
        const validation = await WhatsAppService.validateCredentials(phoneNumberId, accessToken);

        if (!validation.success || !validation.data) {
            return NextResponse.json({
                error: "Meta Validation Failed",
                details: validation.error
            }, { status: 422 });
        }

        // 2. Encrypt Secrets (PHASE 1)
        const encryptedSecret = encrypt(appSecret);
        const encryptedToken = encrypt(accessToken);

        // 3. Save to Database (PHASE 1)
        const account = await prisma.whatsAppAccount.upsert({
            where: { workspace_id: user.workspaceId },
            update: {
                waba_id: wabaId,
                phone_number_id: phoneNumberId,
                app_id: appId,
                app_secret: encryptedSecret,
                access_token: encryptedToken,
                phone_number: validation.data.phoneNumber || "Unknown",
                display_name: validation.data.verifiedName || "WhatsApp Account",
                quality_rating: validation.data.qualityRating,
                integration_status: "ACTIVE", // Manual activation for now
                status: "CONNECTED",
                validated_at: new Date()
            },
            create: {
                workspace_id: user.workspaceId,
                waba_id: wabaId,
                phone_number_id: phoneNumberId,
                app_id: appId,
                app_secret: encryptedSecret,
                access_token: encryptedToken,
                phone_number: validation.data.phoneNumber || "Unknown",
                display_name: validation.data.verifiedName || "WhatsApp Account",
                quality_rating: validation.data.qualityRating,
                integration_status: "ACTIVE",
                status: "CONNECTED",
                validated_at: new Date()
            }
        });

        // 4. Create Audit Log (PHASE 8)
        await prisma.integrationAuditLog.create({
            data: {
                whatsapp_account_id: account.id,
                workspace_id: user.workspaceId,
                action: "INTEGRATION_CREATED",
                details: {
                    method: "MANUAL",
                    phone_number: validation.data.phoneNumber
                }
            }
        });

        return NextResponse.json({
            success: true,
            data: validation.data
        });

    } catch (error: any) {
        console.error("Manual Setup Error:", error);
        return NextResponse.json({ error: error.message || "Setup failed" }, { status: 500 });
    }
}
