import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AddonService } from '@/lib/addons/addon-service';

/**
 * 🛰️ ADDONS MARKETPLACE API
 */
export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user || !user.workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 1. Get all available addons
        const allAddons = await (prisma as any).addon.findMany({
            where: { is_active: true }
        });

        // 2. Get active addons for this workspace
        const activeAddons = await AddonService.getActiveAddons(user.workspaceId);
        const activeIds = new Set(activeAddons.map((a: any) => a.addon_id));

        const result = allAddons.map((addon: any) => ({
            ...addon,
            isActivated: activeIds.has(addon.id)
        }));

        return NextResponse.json({ success: true, addons: result });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user || !user.workspaceId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { addonId } = await req.json();
        
        // 1. Find the addon
        const addon = await (prisma as any).addon.findUnique({ where: { id: addonId } });
        if (!addon) return NextResponse.json({ error: "Addon not found" }, { status: 404 });

        // 2. Check Credits (Assuming we have a Credit check here)
        // For now, we proceed with activation
        await AddonService.activateAddon(user.workspaceId, addonId, addon.price);

        return NextResponse.json({ 
            success: true, 
            message: `${addon.title} activated successfully!` 
        });

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
