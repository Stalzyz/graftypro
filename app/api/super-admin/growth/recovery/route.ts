import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { requireSuperAdmin } from "../../../../../lib/admin-auth";
import { WhatsAppService } from "../../../../../lib/whatsapp/service";
import { SystemConfigService } from "../../../../../lib/services/system-config-service";
import { decrypt } from "../../../../../lib/security/encryption";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        await requireSuperAdmin();

        // 1. Fetch Users who signed up but have NO workspaces
        // @ts-ignore -- workspace_id filter intentional
        const abandonedUsers = await prisma.user.findMany({
            where: {
                workspace_id: null,
                role: "OWNER" as any,
            },
            // @ts-ignore -- name field used for display
            select: {
                id: true,
                first_name: true,
                last_name: true,
                email: true,
                phone: true,
                created_at: true,
            } as any,
            orderBy: { created_at: 'desc' },
            take: 50
        });

        // 2. Aggregate Stats
        // @ts-ignore -- workspace_id filter intentional
        const totalAbandoned = await prisma.user.count({
            where: { workspace_id: null, role: "OWNER" as any }
        });

        // Mocking some stats for the UI until tracking fields are fully migrated
        const stats = {
            total_abandoned: totalAbandoned,
            reached_percentage: 0,
            recovery_count: 0
        };

        return NextResponse.json({
            users: abandonedUsers,
            stats
        });
    } catch (error: any) {
        console.error("Growth Recovery GET Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        await requireSuperAdmin();
        const { userId, phone } = await request.json();

        if (!userId || !phone) {
            return NextResponse.json({ error: "Missing userId or phone number" }, { status: 400 });
        }

        // 1. Get Platform WABA Config
        const config: any = await prisma.systemConfig.findUnique({ where: { id: "global" } });

        if (!config?.meta_phone_id || !config?.meta_permanent_token_enc) {
            return NextResponse.json({ error: "Super Admin WABA not configured in Meta Architecture" }, { status: 400 });
        }

        const token = decrypt(config.meta_permanent_token_enc);
        const userData = await prisma.user.findUnique({ where: { id: userId }, select: { first_name: true } });
        const name = userData?.first_name || "there";

        // 2. Send Message (Using a standard recovery template or text)
        // Note: For production, a pre-approved Meta Template is required for outbound reachout.
        // We'll use a professional text message for now (assuming 24h window or sandbox).

        const message = `Hello ${name}! 👋\n\nI noticed you started setting up your Grafty dashboard but didn't finish. \n\nNeed help getting your first WhatsApp campaign live? Reply to this message and I'll personally help you get started! 🚀`;

        await WhatsAppService.sendText(
            config.meta_phone_id,
            token,
            phone,
            message
        );

        // 3. Mark as reached (Assuming field exists or log activity)
        // await prisma.user.update({ where: { id: userId }, data: { last_reached_at: new Date() } });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Growth Recovery POST Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
