import { NextResponse } from "next/server";
import { SystemConfigService } from "../../../../lib/services/system-config-service";

export async function GET(request: Request) {
    try {
        const config = await SystemConfigService.getPublicConfig();
        const FACEBOOK_CLIENT_ID = config.facebook_client_id || process.env.FACEBOOK_CLIENT_ID;

        const REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI || `${process.env.NEXT_PUBLIC_APP_URL || "https://grafty.pro"}/api/auth/facebook/callback`;

        // Allow localhost fallback for dev
        const cleanRedirectUri = process.env.NODE_ENV === "development"
            ? "http://localhost:3000/api/auth/facebook/callback"
            : REDIRECT_URI;

        if (!FACEBOOK_CLIENT_ID) {
            return NextResponse.json({ error: "Facebook Auth not configured in Super Admin settings or environment variables." }, { status: 500 });
        }

        const scope = "email,public_profile";

        // Use standard Facebook OAuth Dialog
        const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FACEBOOK_CLIENT_ID}&redirect_uri=${cleanRedirectUri}&response_type=code&scope=${scope}`;

        return NextResponse.redirect(url);
    } catch (error) {
        console.error("Facebook init error:", error);
        return NextResponse.json({ error: "Failed to initialize Facebook Login" }, { status: 500 });
    }
}
