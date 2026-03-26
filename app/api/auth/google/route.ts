
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || "https://grafty.pro"}/api/auth/google/callback`;

    // Allow localhost fallback for dev
    const cleanRedirectUri = process.env.NODE_ENV === "development"
        ? "http://localhost:3000/api/auth/google/callback"
        : REDIRECT_URI;

    if (!GOOGLE_CLIENT_ID) {
        return NextResponse.json({ error: "Google Auth not configured" }, { status: 500 });
    }

    const scope = [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
    ].join(" ");

    // Preserve the originating white-label domain
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "grafty.pro";
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    const originState = encodeURIComponent(Buffer.from(JSON.stringify({ returnTo: `${protocol}://${host}` })).toString('base64'));

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${cleanRedirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${originState}`;

    return NextResponse.redirect(url);
}
