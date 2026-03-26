import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const headers = Object.fromEntries(req.headers.entries());
    const host = req.headers.get("host") || "none";
    const xForwardedHost = req.headers.get("x-forwarded-host") || "none";
    const url = req.url;

    return NextResponse.json({
        success: true,
        diagnostic: {
            detectedHost: host,
            xForwardedHost: xForwardedHost,
            fullUrl: url,
            allHeaders: headers
        }
    });
}
