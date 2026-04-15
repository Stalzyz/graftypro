import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { encrypt } from "@/lib/security/encryption";
import nodemailer from "nodemailer";

export async function GET(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user?.workspaceId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const workspace = await prisma.workspace.findUnique({
            where: { id: user.workspaceId },
            select: {
                smtp_host: true,
                smtp_port: true,
                smtp_user: true,
                smtp_from_name: true,
                smtp_from_email: true,
                smtp_encryption: true,
                email_signature_html: true,
                // Do NOT send the password enc back to the client!
                smtp_pass_enc: true // Just to see if it's set
            }
        });

        return NextResponse.json({
            ...workspace,
            has_password: !!workspace?.smtp_pass_enc, // Boolean flag instead of actual password
            smtp_pass_enc: undefined 
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const user = await getCurrentUser(req);
        if (!user?.workspaceId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { smtp_host, smtp_port, smtp_user, smtp_pass, smtp_from_name, smtp_from_email, smtp_encryption, email_signature_html } = body;

        // Optionally, test the credentials immediately
        if (smtp_host && smtp_user && smtp_pass) {
            try {
                const secure = smtp_encryption === "SSL" || parseInt(smtp_port) === 465;
                const transporter = nodemailer.createTransport({
                    host: smtp_host,
                    port: parseInt(smtp_port) || 587,
                    secure: secure,
                    auth: {
                        user: smtp_user,
                        pass: smtp_pass,
                    },
                });

                // Verify connection
                await transporter.verify();
            } catch (err: any) {
                return NextResponse.json({ error: `SMTP Verification Failed: ${err.message}` }, { status: 400 });
            }
        }

        // Encrypt the password before saving
        const smtp_pass_enc = smtp_pass ? encrypt(smtp_pass) : undefined;

        const updateData: any = {
            smtp_host,
            smtp_port: parseInt(smtp_port) || 587,
            smtp_user,
            smtp_from_name,
            smtp_from_email,
            smtp_encryption,
            email_signature_html
        };

        if (smtp_pass_enc) {
            updateData.smtp_pass_enc = smtp_pass_enc;
        }

        await prisma.workspace.update({
            where: { id: user.workspaceId },
            data: updateData
        });

        return NextResponse.json({ success: true, message: "SMTP configuration updated successfully." });

    } catch (e: any) {
        console.error("[SMTP_UPDATE_ERROR]", e);
        return NextResponse.json({ error: e.message || "Internal server error" }, { status: 500 });
    }
}
