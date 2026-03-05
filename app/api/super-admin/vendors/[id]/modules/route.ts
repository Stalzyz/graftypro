import { NextResponse } from "next/server";
import { prisma } from "../../../../../../lib/db";
import { getAdminSession } from "../../../../../../lib/admin-auth";

export const dynamic = "force-dynamic";

const ALLOWED_MODULES = [
    "flow_builder", "drip", "broadcast", "template_creator",
    "reseller", "white_label", "wallet", "analytics", "api_access"
];

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const ws = await prisma.workspace.findUnique({ where: { id: params.id }, select: { settings: true } });
    if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const settings: any = ws.settings || {};
    const modules = settings.modules || {};

    // Return all modules with defaults
    const result: Record<string, boolean> = {};
    for (const mod of ALLOWED_MODULES) {
        result[mod] = modules[mod] !== false; // default ON unless explicitly disabled
    }

    return NextResponse.json({ modules: result });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { module, enabled } = body;

    if (!ALLOWED_MODULES.includes(module)) {
        return NextResponse.json({ error: "Invalid module" }, { status: 400 });
    }

    const ws = await prisma.workspace.findUnique({ where: { id: params.id }, select: { settings: true } });
    if (!ws) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const settings: any = ws.settings || {};
    const modules = settings.modules || {};
    modules[module] = enabled;

    await prisma.workspace.update({
        where: { id: params.id },
        data: { settings: { ...settings, modules } }
    });

    // @ts-ignore
    await prisma.adminAuditLog.create({
        data: {
            admin_id: session.id,
            action: enabled ? "MODULE_ENABLE" : "MODULE_DISABLE",
            resource: params.id,
            details: { module, enabled }
        }
    });

    return NextResponse.json({ success: true, module, enabled });
}
