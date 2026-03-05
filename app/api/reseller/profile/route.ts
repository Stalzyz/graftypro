
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "../../../../lib/auth";

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const token = cookies().get("partner_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload || payload.role !== "RESELLER") {
            return NextResponse.json({ error: "Invalid Partner Session" }, { status: 401 });
        }

        const reseller = await prisma.reseller.findUnique({
            where: { id: payload.userId },
            select: {
                id: true,
                email: true,
                name: true,
                business_name: true,
                avatar_url: true,
                bio: true,
                referral_code: true
            }
        });

        return NextResponse.json(reseller);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const token = cookies().get("partner_token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const payload = await verifyToken(token);
        if (!payload || payload.role !== "RESELLER") {
            return NextResponse.json({ error: "Invalid Partner Session" }, { status: 401 });
        }

        const body = await req.json();
        const { name, business_name, avatar_url, bio } = body;

        const updated = await prisma.reseller.update({
            where: { id: payload.userId },
            data: {
                name,
                business_name,
                avatar_url,
                bio
            }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
