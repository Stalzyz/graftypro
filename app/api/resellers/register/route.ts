
import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, email, phone, company_name, expected_vendors, experience, website } = body;

        if (!email || !name) {
            return NextResponse.json({ error: "Name and Email are required" }, { status: 400 });
        }

        // Check if already registered
        const existing = await prisma.reseller.findUnique({
            where: { email }
        });

        if (existing) {
            return NextResponse.json({ error: "Email already registered for evaluation" }, { status: 400 });
        }

        // Generate a temporary referral code
        const referral_code = "PEND-" + Math.random().toString(36).substring(2, 7).toUpperCase();

        const reseller = await prisma.reseller.create({
            data: {
                name,
                email,
                business_name: company_name,
                referral_code,
                status: "PENDING",
                bio: JSON.stringify({
                    phone,
                    expected_vendors,
                    experience,
                    website,
                    applied_at: new Date().toISOString()
                })
            }
        });

        return NextResponse.json({ success: true, data: reseller });
    } catch (error: any) {
        console.error("Reseller registration error:", error);
        return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
    }
}
