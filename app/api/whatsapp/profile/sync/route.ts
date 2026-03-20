import { NextResponse } from "next/server";
import { prisma } from "../../../../../lib/db";
import { getCurrentUser } from "../../../../../lib/auth";
import { decrypt } from "../../../../../lib/security/encryption";
import axios from "axios";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const account = await prisma.whatsAppAccount.findUnique({
            where: { workspace_id: user.workspaceId }
        });

        if (!account) {
            return NextResponse.json({ error: "No connection found" }, { status: 404 });
        }

        const token = decrypt(account.access_token);
        const phoneNumberId = account.phone_number_id;

        try {
            const res = await axios.get(
                `https://graph.facebook.com/v20.0/${phoneNumberId}/whatsapp_business_profile?fields=profile_picture_url,about,description,email,websites,vertical,address`,
                {
                    headers: { "Authorization": `Bearer ${token}` }
                }
            );

            if (res.data?.data?.[0]) {
                const profile = res.data.data[0];
                const picUrl = profile.profile_picture_url || account.profile_picture_url;

                // Get meta name as display name as well
                let displayName = account.display_name;
                try {
                    const nameRes = await axios.get(`https://graph.facebook.com/v20.0/${phoneNumberId}`, {
                        headers: { "Authorization": `Bearer ${token}` }
                    });
                    if (nameRes.data?.verified_name) displayName = nameRes.data.verified_name;
                } catch (e) { } // Ignore error getting name

                await prisma.whatsAppAccount.update({
                    where: { id: account.id },
                    data: {
                        profile_picture_url: picUrl,
                        display_name: displayName,
                        token_valid: true,
                        api_status: "OK",
                        last_error: null,
                        last_health_check_at: new Date()
                    }
                });

                return NextResponse.json({
                    success: true,
                    profile_picture_url: picUrl,
                    display_name: displayName
                });
            } else {
                return NextResponse.json({ error: "Profile empty" }, { status: 404 });
            }

        } catch (error: any) {
            console.error("Meta Profile Sync Error:", error.response?.data || error.message);
            await prisma.whatsAppAccount.update({
                where: { id: account.id },
                data: {
                    api_status: "ERROR",
                    last_error: "Sync failed: " + (error.response?.data?.error?.message || "Unknown Meta Error"),
                    last_health_check_at: new Date()
                }
            });
            return NextResponse.json({ error: "Sync rejected the request" }, { status: 422 });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
