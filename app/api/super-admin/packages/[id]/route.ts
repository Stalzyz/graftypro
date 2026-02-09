
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const body = await req.json();
        const { id } = params;

        const pkg = await prisma.subscriptionPlan.update({
            where: { id },
            data: body
        });

        return NextResponse.json({ data: pkg });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to update package" }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        // Check if any workspace is using this plan
        const usageCount = await prisma.workspace.count({
            where: { current_plan_id: id }
        });

        if (usageCount > 0) {
            return NextResponse.json({ error: `Cannot delete plan. It's used by ${usageCount} workspaces.` }, { status: 400 });
        }

        await prisma.subscriptionPlan.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to delete package" }, { status: 500 });
    }
}
