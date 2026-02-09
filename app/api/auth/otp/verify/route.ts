import { NextResponse } from "next/server";
import { OTPService } from "@/lib/services/otp-service";

export async function POST(req: Request) {
    try {
        const { identifier, code } = await req.json();

        if (!identifier || !code) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const result = await OTPService.verifyOTP(identifier, code);

        if (!result.success) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: "Verification successful."
        });

    } catch (error: any) {
        console.error("[OTP Verify Error]", error.message);
        return NextResponse.json({ error: "Verification system error." }, { status: 500 });
    }
}
