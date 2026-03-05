import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";
import { encrypt, decrypt } from "../../../../lib/security/encryption";
import axios from "axios";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { connection_name, waba_id, phone_number_id, app_id, app_secret, access_token } = body;

        // Fetch current account
        const account = await prisma.whatsAppAccount.findUnique({
            where: { workspace_id: user.workspaceId }
        });

        if (!account) {
            return NextResponse.json({ error: "No connection found to edit" }, { status: 404 });
        }

        const updates: any = {};
        if (connection_name) updates.connection_name = connection_name;
        if (waba_id) updates.waba_id = waba_id;
        if (phone_number_id) updates.phone_number_id = phone_number_id;
        if (app_id !== undefined) updates.app_id = app_id;

        let actualTokenToTest = decrypt(account.access_token);

        if (app_secret && app_secret !== "******") {
            updates.app_secret = encrypt(app_secret);
        }

        if (access_token && access_token !== "******") {
            updates.access_token = encrypt(access_token);
            actualTokenToTest = access_token;
        }

        const testPhoneNumberId = phone_number_id || account.phone_number_id;

        // Validate token with Meta using the actual token
        try {
            const res = await axios.get(`https://graph.facebook.com/v18.0/${testPhoneNumberId}`, {
                headers: { Authorization: `Bearer ${actualTokenToTest}` }
            });
            if (res.data) {
                updates.token_valid = true;
                updates.api_status = "OK";
                updates.last_error = null;
                updates.status = "CONNECTED";
            }
        } catch (error: any) {
            console.error("Meta Validation Error:", error.response?.data || error.message);
            return NextResponse.json({ error: "Invalid Meta credentials or Phone Number ID" }, { status: 400 });
        }

        await prisma.whatsAppAccount.update({
            where: { id: account.id },
            data: updates
        });

        return NextResponse.json({ success: true, message: "Connection Updated Successfully" });

    } catch (error: any) {
        console.error("Edit connection error:", error);
        return NextResponse.json({ error: "Failed to update connection" }, { status: 500 });
    }
}
