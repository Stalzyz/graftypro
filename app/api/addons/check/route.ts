import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user || !user.workspace_id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const addonName = searchParams.get("name");

        if (!addonName) {
            return NextResponse.json({ error: "Addon name required" }, { status: 400 });
        }

        const addon = await prisma.addon.findUnique({
            where: { name: addonName }
        });

        if (!addon) {
            return NextResponse.json({ active: false, error: "Addon not found" });
        }

        const activation = await prisma.workspaceAddon.findUnique({
            where: {
                workspace_id_addon_id: {
                    workspace_id: user.workspace_id,
                    addon_id: addon.id
                }
            }
        });

        return NextResponse.json({ 
            active: activation?.status === "ACTIVE",
            addon: {
                title: addon.title,
                price: addon.price,
                description: addon.description
            }
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
