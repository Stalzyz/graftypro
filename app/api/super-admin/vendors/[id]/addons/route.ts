import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import { getAdminSession } from "../../../../../../lib/admin-auth";
import { AddonService } from "../../../../../../lib/addons/addon-service";

export const dynamic = "force-dynamic";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const allAddons = await (prisma as any).addon.findMany({
        where: { is_active: true }
    });

    const activeAddons = await (prisma as any).workspaceAddon.findMany({
        where: { workspace_id: params.id }
    });

    const result = allAddons.map((addon: any) => {
        const activation = activeAddons.find((aa: any) => aa.addon_id === addon.id);
        return {
            ...addon,
            status: activation?.status || "INACTIVE",
            activated_at: activation?.activated_at || null
        };
    });

    return NextResponse.json({ addons: result });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { addonId, action } = body; // action: 'ACTIVATE' | 'DEACTIVATE'

    try {
        if (action === "ACTIVATE") {
            await AddonService.activateAddon(params.id, addonId, undefined, true); // skipCredits = true
        } else if (action === "DEACTIVATE") {
            await AddonService.deactivateAddon(params.id, addonId);
        } else {
            return NextResponse.json({ error: "Invalid action" }, { status: 400 });
        }

        // Log the action
        // @ts-ignore
        await prisma.adminAuditLog.create({
            data: {
                admin_id: session.id,
                action: action === "ACTIVATE" ? "ADDON_PROVISION" : "ADDON_REVOKE",
                resource: params.id,
                details: { addonId, action }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
