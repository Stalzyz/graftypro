import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

export async function GET() {
    console.log("--- DEEP DIVE DIAGNOSTIC API ---");
    const report: any = {
        user: null,
        waba: null,
        upsert_test: null,
        errors: [],
        schema_audit: {}
    };

    try {
        const demoEmail = "demo@grafty.com";
        const user = await prisma.user.findFirst({
            where: { email: demoEmail }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: "Demo user not found" });
        }

        report.user = { id: user.id, workspace_id: user.workspace_id };

        // 1. Audit WhatsAppAccount
        try {
            const waba = await prisma.whatsAppAccount.findUnique({
                where: { workspace_id: user.workspace_id }
            });
            report.waba = waba ? {
                id: waba.id,
                billing_model: (waba as any).billing_model || "EXISTS"
            } : "MISSING";
        } catch (e: any) {
            report.errors.push(`WABA ERROR: ${e.message}`);
        }

        // 2. Audit Table Columns
        try {
            const tColumns: any = await prisma.$queryRawUnsafe(`
                SELECT column_name FROM information_schema.columns WHERE table_name = 'templates'
            `);
            report.schema_audit.templates = tColumns.map((c: any) => c.column_name);

            const wColumns: any = await prisma.$queryRawUnsafe(`
                SELECT column_name FROM information_schema.columns WHERE table_name = 'whatsapp_accounts'
            `);
            report.schema_audit.whatsapp_accounts = wColumns.map((c: any) => c.column_name);
        } catch (e: any) {
            report.errors.push(`SCHEMA ERROR: ${e.message}`);
        }

        // 3. Audit Enums
        try {
            const enums: any = await prisma.$queryRawUnsafe(`
                SELECT t.typname as enum_name, e.enumlabel as enum_value
                FROM pg_type t 
                JOIN pg_enum e ON t.oid = e.enumtypid
                JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
                WHERE n.nspname = 'public'
            `);
            report.schema_audit.enums = enums.reduce((acc: any, curr: any) => {
                if (!acc[curr.enum_name]) acc[curr.enum_name] = [];
                acc[curr.enum_name].push(curr.enum_value);
                return acc;
            }, {});
        } catch (e: any) {
            report.errors.push(`ENUM ERROR: ${e.message}`);
        }

        // 3. Test Complex Upsert
        try {
            const mt = {
                name: "deep_dive_test_" + Date.now(),
                language: "en_US",
                category: "UTILITY",
                status: "APPROVED",
                components: [{ type: "BODY", text: "Test content" }]
            };

            const result = await prisma.template.upsert({
                where: {
                    workspace_id_name_language: {
                        workspace_id: user.workspace_id,
                        name: mt.name,
                        language: mt.language
                    }
                },
                update: { status: "APPROVED" },
                create: {
                    workspace_id: user.workspace_id,
                    name: mt.name,
                    language: mt.language,
                    category: "UTILITY",
                    status: "APPROVED",
                    components: mt.components as any
                }
            });
            report.upsert_test = "SUCCESS";
        } catch (e: any) {
            report.upsert_test = { status: "FAILED", message: e.message, code: e.code };
        }

        return NextResponse.json({ success: true, report });

    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
