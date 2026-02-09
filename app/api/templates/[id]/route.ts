import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const template = await prisma.template.findUnique({
            where: { id: params.id },
            include: { variables: true }
        });

        if (!template || template.workspace_id !== user.workspaceId) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        return NextResponse.json({ data: template });
    } catch (error) {
        return NextResponse.json({ error: "Error fetching template" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        const user = await getCurrentUser(req);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await req.json();
        const { components, variables } = body;

        // Verify Ownership
        const existing = await prisma.template.findUnique({
            where: { id: params.id },
        });

        if (!existing || existing.workspace_id !== user.workspaceId) {
            return NextResponse.json({ error: "Not found" }, { status: 404 });
        }

        if (existing.status !== 'DRAFT' && existing.status !== 'REJECTED') {
            return NextResponse.json({ error: "Cannot edit a template that is " + existing.status }, { status: 403 });
        }

        // Update Components
        await prisma.template.update({
            where: { id: params.id },
            data: {
                components: components
            }
        });

        // Update Variables (Full replace strategy for simplicity)
        if (variables && Array.isArray(variables)) {
            await prisma.templateVariable.deleteMany({
                where: { template_id: params.id }
            });

            if (variables.length > 0) {
                await prisma.templateVariable.createMany({
                    data: variables.map((v: any) => ({
                        template_id: params.id,
                        component_index: v.component_index,
                        param_index: v.param_index,
                        sample_value: v.sample_value
                    }))
                });
            }
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Template Update Error", error);
        return NextResponse.json({ error: "Error updating template" }, { status: 500 });
    }
}
