
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { publishLandingPage } from "@/lib/cms";

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const user = await getCurrentUser(req);
    if (!user || user.role !== 'SUPER_ADMIN') return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const snapshot = await publishLandingPage(params.id);
        return NextResponse.json({ success: true, data: snapshot });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to publish" }, { status: 500 });
    }
}
