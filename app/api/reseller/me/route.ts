import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getResellerSession } from "../../../../lib/reseller/auth-helper";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const session = await getResellerSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const reseller = await prisma.reseller.findUnique({
            where: { id: session.userId },
            select: {
                id: true,
                email: true,
                name: true,
                business_name: true,
                // @ts-ignore
                role: true,
                status: true,
                wallet_balance: true,
                total_earned: true,
                brand_name: true,
                logo_url: true,
                favicon_url: true,
                custom_domain: true,
                referral_code: true,
                is_frozen: true
            }
        });

        if (!reseller) {
            return NextResponse.json({ error: "Reseller not found" }, { status: 404 });
        }

        return NextResponse.json({ data: reseller });

    } catch (error) {
        console.error("Fetch Reseller Me Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
