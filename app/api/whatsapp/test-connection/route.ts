import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";
import { getCurrentUser } from "../../../../lib/auth";
import { decrypt } from "../../../../lib/security/encryption";
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
            // Check Token validity
            const res = await axios.get(
                `https://graph.facebook.com/v18.0/${phoneNumberId}`,
                { headers: { "Authorization": `Bearer ${token}` } }
            );

            if (res.data?.id) {
                await prisma.whatsAppAccount.update({
                    where: { id: account.id },
                    data: {
                        token_valid: true,
                        api_status: "OK",
                        last_error: null,
                        last_health_check_at: new Date()
                    }
                });

                return NextResponse.json({ success: true, message: "Connection OK" });
            }

        } catch (error: any) {
            console.error("Test Connection Error:", error.response?.data || error.message);

            await prisma.whatsAppAccount.update({
                where: { id: account.id },
                data: {
                    token_valid: false,
                    api_status: "ERROR",
                    last_error: "Invalid Token or Meta API Failure: " + (error.response?.data?.error?.message || "Unknown Error"),
                    last_health_check_at: new Date(),
                    status: "DISCONNECTED" // Critical failure, mark disconnected
                }
            });

            return NextResponse.json({ error: "Test Failed. Credentials invalid." }, { status: 422 });
        }

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
