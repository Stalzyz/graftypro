import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

export async function POST() {
    const response = NextResponse.json({
        success: true,
        message: "Logged out successfully"
    });

    // Clear the partner token cookie
    response.cookies.set("partner_token", "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: new Date(0), // Expire immediately
        path: "/",
    });

    return response;
}
