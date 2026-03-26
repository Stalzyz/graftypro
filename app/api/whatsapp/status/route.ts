import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        console.log(`[STATUS DEBUG] Checking status for Workspace: ${user.workspaceId}`);

        const account = await prisma.whatsAppAccount.findUnique({
            where: { workspace_id: user.workspaceId }
        });

        if (!account) {
            console.log(`[STATUS DEBUG] No account found in DB for Workspace: ${user.workspaceId}`);
        } else {
            console.log(`[STATUS DEBUG] Account found! Status: ${account.status}, Integration: ${account.integration_status}`);
        }

        if (account && account.status === 'CONNECTED') {
            return NextResponse.json({
                status: 'CONNECTED',
                workspaceId: user.workspaceId,
                account: {
                    phone_number: account.phone_number,
                    display_name: account.display_name,
                    quality_rating: account.quality_rating,
                    messaging_limit: account.messaging_limit,
                    waba_id: account.waba_id,
                    phone_number_id: account.phone_number_id,
                    integration_status: account.integration_status,
                    health_status: account.health_status,
                    last_health_check_at: account.last_health_check_at,
                    connection_name: account.connection_name,
                    profile_picture_url: account.profile_picture_url,
                    token_valid: account.token_valid,
                    webhook_status: account.webhook_status,
                    api_status: account.api_status,
                    last_error: account.last_error
                }
            });
        }

        return NextResponse.json({ status: 'DISCONNECTED', workspaceId: user.workspaceId });

    } catch (e) {
        return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
}
