import { NextResponse } from "next/server";
import { OTPService } from "@/lib/services/otp-service";

export async function POST(req: Request) {
    try {
        const { type, identifier, workspaceId } = await req.json(); // type: 'EMAIL' | 'PHONE'

        if (!identifier || type?.toUpperCase() !== 'EMAIL') {
            return NextResponse.json({ error: "Only EMAIL verification is currently supported." }, { status: 400 });
        }

        await OTPService.sendOTP(identifier, type.toUpperCase() as any, workspaceId);

        return NextResponse.json({
            success: true,
            message: `Verification code sent to your ${type.toLowerCase()}.`
        });

    } catch (error: any) {
        console.error("[OTP API Error]", error.message);
        return NextResponse.json({ error: "Failed to dispatch verification code." }, { status: 500 });
    }
}
