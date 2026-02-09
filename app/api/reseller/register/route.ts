
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";
import { ResellerService } from "@/lib/reseller/service";
import { encrypt } from "@/lib/security/encryption";

export async function POST(req: Request) {
    try {
        const {
            name,
            email,
            password,
            business_name,
            bank_details
        } = await req.json();

        // 1. Basic Validation
        if (!email || !password || !name) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const existing = await prisma.reseller.findUnique({ where: { email } });
        if (existing) {
            return NextResponse.json({ error: "Email already registered" }, { status: 400 });
        }

        // 2. Generate Referral Code
        const referral_code = await ResellerService.generateReferralCode(name);

        // 3. Encrypt Bank Details (Module 1/Acceptance Criteria: Security)
        let encryptedBank: any = {};
        if (bank_details) {
            encryptedBank = {
                bank_account_holder: bank_details.holder ? encrypt(bank_details.holder) : null,
                bank_account_number: bank_details.account ? encrypt(bank_details.account) : null,
                bank_ifsc: bank_details.ifsc ? encrypt(bank_details.ifsc) : null,
                bank_name: bank_details.bank_name || null
            };
        }

        // 4. Hash Password
        const password_hash = await bcrypt.hash(password, 10);

        // 5. Create Reseller
        const reseller = await prisma.reseller.create({
            data: {
                name,
                email,
                password_hash,
                business_name,
                referral_code,
                status: "PENDING", // Requires Admin Approval
                kyc_status: "NONE",
                ...encryptedBank
            }
        });

        return NextResponse.json({
            success: true,
            message: "Application submitted. Our team will review it shortly.",
            referral_code: reseller.referral_code
        });

    } catch (error) {
        console.error("Reseller Onboarding Error:", error);
        return NextResponse.json({ error: "Submission failed" }, { status: 500 });
    }
}
