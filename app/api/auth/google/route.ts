
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const requestedScope = searchParams.get("scope");
    const isIntegration = searchParams.get("integration") === "true";

    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || "https://grafty.pro"}/api/auth/google/callback`;

    // Allow localhost fallback for dev
    const cleanRedirectUri = process.env.NODE_ENV === "development"
        ? "http://localhost:3000/api/auth/google/callback"
        : REDIRECT_URI;

    if (!GOOGLE_CLIENT_ID) {
        return NextResponse.json({ error: "Google Auth not configured" }, { status: 500 });
    }

    const scopes = [
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/userinfo.profile"
    ];

    let integrationType = "GOOGLE_CALENDAR";
    
    if (requestedScope === "calendar") {
        scopes.push("https://www.googleapis.com/auth/calendar.events");
    } else if (requestedScope === "sheets") {
        scopes.push("https://www.googleapis.com/auth/spreadsheets");
        integrationType = "GOOGLE_SHEETS";
    }

    const scopeString = scopes.join(" ");

    // Preserve the originating white-label domain + integration flag
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "grafty.pro";
    const protocol = request.headers.get("x-forwarded-proto") || "https";
    
    // We base64 encode the state so it remains a single valid URL string
    const statePayload = {
        returnTo: `${protocol}://${host}`,
        isIntegration: isIntegration,
        integrationType: integrationType
    };
    const originState = encodeURIComponent(Buffer.from(JSON.stringify(statePayload)).toString('base64'));

    // access_type=offline is CRITICAL to get a refresh_token
    // prompt=consent ensures we get a refresh_token every time for development/testing
    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${cleanRedirectUri}&response_type=code&scope=${scopeString}&access_type=offline&prompt=consent&state=${originState}`;

    return NextResponse.redirect(url);
}
