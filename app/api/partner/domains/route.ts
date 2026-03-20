
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user || user.role !== "RESELLER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const domains = await prisma.partnerDomain.findMany({
            where: { reseller_id: user.userId },
            orderBy: { created_at: "desc" }
        });

        return NextResponse.json({ data: domains });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user || user.role !== "RESELLER") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { domain } = await req.json();
        if (!domain) return NextResponse.json({ error: "Domain is required" }, { status: 400 });

        // Normalize domain
        const cleanDomain = domain.toLowerCase().trim().replace(/^https?:\/\//, '').replace(/\/$/, '');

        // Check if domain already exists
        const existing = await prisma.partnerDomain.findUnique({
            where: { domain: cleanDomain }
        });

        if (existing) {
            return NextResponse.json({ error: "Domain already registered" }, { status: 400 });
        }

        const newDomain = await prisma.partnerDomain.create({
            data: {
                reseller_id: user.userId,
                domain: cleanDomain,
                verification_token: `v=grafty-verify-${Math.random().toString(36).substring(2, 15)}`,
                target_host: process.env.NEXT_PUBLIC_APP_URL?.replace(/^https?:\/\//, '') || "app.grafty.pro"
            }
        });

        return NextResponse.json({ success: true, data: newDomain });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
