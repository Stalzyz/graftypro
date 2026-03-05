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

        const formData = await req.formData();
        const file = formData.get("file") as Blob;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        // Validate type
        const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json({ error: "Invalid image format. Use JPG, PNG or WEBP" }, { status: 400 });
        }

        // Validate size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            return NextResponse.json({ error: "Image too large. Max 2MB" }, { status: 400 });
        }

        const token = decrypt(account.access_token);
        const phoneNumberId = account.phone_number_id;

        // 1. Upload to Meta Media API
        const metaFormData = new FormData();
        metaFormData.append("messaging_product", "whatsapp");
        metaFormData.append("file", file);
        metaFormData.append("type", file.type);

        let mediaId;
        try {
            const uploadRes = await axios.post(
                `https://graph.facebook.com/v18.0/${phoneNumberId}/media`,
                metaFormData,
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        // Let axios handle multipart boundary
                        "Content-Type": "multipart/form-data"
                    }
                }
            );
            mediaId = uploadRes.data.id;
        } catch (error: any) {
            console.error("Meta Media Upload Error:", error.response?.data || error.message);
            return NextResponse.json({ error: "Meta rejected the media upload request" }, { status: 422 });
        }

        if (!mediaId) {
            return NextResponse.json({ error: "Failed to get Media ID from Meta" }, { status: 500 });
        }

        // 2. Set as Profile Picture
        try {
            await axios.post(
                `https://graph.facebook.com/v18.0/${phoneNumberId}/whatsapp_business_profile`,
                {
                    messaging_product: "whatsapp",
                    profile_picture_handle: mediaId
                },
                {
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json"
                    }
                }
            );
        } catch (error: any) {
            console.error("Meta Profile Update Error:", error.response?.data || error.message);
            return NextResponse.json({ error: "Meta rejected the profile picture update" }, { status: 422 });
        }

        // 3. Fetch Updated Profile to get URL
        let profilePicUrl = "";
        try {
            const profileRes = await axios.get(
                `https://graph.facebook.com/v18.0/${phoneNumberId}/whatsapp_business_profile?fields=profile_picture_url`,
                {
                    headers: { "Authorization": `Bearer ${token}` }
                }
            );
            if (profileRes.data?.data?.[0]?.profile_picture_url) {
                profilePicUrl = profileRes.data.data[0].profile_picture_url;

                await prisma.whatsAppAccount.update({
                    where: { id: account.id },
                    data: { profile_picture_url: profilePicUrl }
                });
            }
        } catch (err) {
            console.error("Error fetching updated profile:", err);
            // Non-fatal error
        }

        return NextResponse.json({
            success: true,
            message: "Profile Updated Successfully",
            profile_picture_url: profilePicUrl
        });

    } catch (error: any) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: "Upload failed: " + error.message }, { status: 500 });
    }
}
