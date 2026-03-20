
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";

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
                referral_code: true,
                bank_account_holder: true,
                bank_account_number: true,
                bank_ifsc: true,
                bank_name: true
            }
        });

        if (!reseller) return NextResponse.json({ error: "Reseller not found" }, { status: 404 });

        // Mask sensitive data
        const { decrypt, maskToken } = await import("@/lib/security/encryption");
        const formattedReseller = {
            ...reseller,
            bank_account_number: reseller.bank_account_number ? maskToken(decrypt(reseller.bank_account_number)) : null,
            bank_ifsc: reseller.bank_ifsc ? decrypt(reseller.bank_ifsc) : null,
            bank_account_holder: reseller.bank_account_holder ? decrypt(reseller.bank_account_holder) : null,
        };

        return NextResponse.json(formattedReseller);
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
        const { name, business_name, avatar_url, bio, bank_account_holder, bank_account_number, bank_ifsc, bank_name } = body;

        // Only encrypt if it's a new value (not masked)
        const updateData: any = {
            name,
            business_name,
            avatar_url,
            bio,
            bank_name: bank_name || undefined
        };

        const { encrypt } = await import("@/lib/security/encryption");

        if (bank_account_holder && !bank_account_holder.includes("*")) {
            updateData.bank_account_holder = encrypt(bank_account_holder);
        }
        if (bank_account_number && !bank_account_number.includes("*")) {
            updateData.bank_account_number = encrypt(bank_account_number);
        }
        if (bank_ifsc && !bank_ifsc.includes("*")) {
            updateData.bank_ifsc = encrypt(bank_ifsc);
        }

        const updated = await prisma.reseller.update({
            where: { id: payload.userId },
            data: updateData
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
