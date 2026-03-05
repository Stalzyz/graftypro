import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "../../../../../lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const cookieStore = cookies();
        const partnerToken = cookieStore.get("partner_token")?.value;

        if (!partnerToken) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        const payload = await verifyToken(partnerToken);
        if (!payload?.userId) {
            return NextResponse.json({ authenticated: false }, { status: 401 });
        }

        return NextResponse.json({ authenticated: true, userId: payload.userId });
    } catch {
        return NextResponse.json({ authenticated: false }, { status: 401 });
    }
}
