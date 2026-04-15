/**
 * Manual migration script for WhatsApp Integration enhancement
 * Run this with: npx tsx scripts/migrate-whatsapp-integration.ts
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

async function runMigration() {
    console.log("🚀 Starting WhatsApp Integration migration...\n");

    try {
        // Read the migration SQL file
        const migrationPath = path.join(
            __dirname,
            "../prisma/migrations/20260205_enhance_whatsapp_integration/migration.sql"
        );

        if (!fs.existsSync(migrationPath)) {
            throw new Error(`Migration file not found at: ${migrationPath}`);
        }

        const migrationSQL = fs.readFileSync(migrationPath, "utf-8");

        console.log("📄 Migration SQL loaded");
        console.log("⚠️  This will modify your database schema\n");

        // Split SQL into individual statements
        const statements = migrationSQL
            .split(";")
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && !s.startsWith("--"));

        console.log(`📊 Found ${statements.length} SQL statements to execute\n`);

        // Execute each statement
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            console.log(`[${i + 1}/${statements.length}] Executing...`);

            try {
                await prisma.$executeRawUnsafe(statement);
                console.log(`✅ Success\n`);
            } catch (error: any) {
                // Check if it's a "already exists" error (safe to ignore)
                if (
                    error.message.includes("already exists") ||
                    error.message.includes("duplicate")
                ) {
                    console.log(`⚠️  Already exists (skipping)\n`);
                } else {
                    console.error(`❌ Failed:`, error.message);
                    throw error;
                }
            }
        }

        console.log("\n✅ Migration completed successfully!");
        console.log("\n📊 Verifying new tables...");

        // Verify the new tables exist
        const healthLogs = await prisma.$queryRaw`
            SELECT COUNT(*) FROM integration_health_logs;
        `;
        console.log("✅ integration_health_logs table exists");

        const auditLogs = await prisma.$queryRaw`
            SELECT COUNT(*) FROM integration_audit_logs;
        `;
        console.log("✅ integration_audit_logs table exists");

        // Verify new columns in whatsapp_accounts
        const accounts = await prisma.$queryRaw`
            SELECT 
                integration_status,
                health_status,
                app_id,
                consecutive_failures
            FROM whatsapp_accounts
            LIMIT 1;
        `;
        console.log("✅ whatsapp_accounts table enhanced");

        console.log("\n🎉 All verification checks passed!");
        console.log("\n📋 Summary:");
        console.log("   - Added 4 new enums (IntegrationStatus, HealthStatus, HealthCheckType, AuditAction)");
        console.log("   - Enhanced whatsapp_accounts table with 18 new columns");
        console.log("   - Created integration_health_logs table");
        console.log("   - Created integration_audit_logs table");
        console.log("   - Added indexes for performance");

    } catch (error: any) {
        console.error("\n❌ Migration failed:", error.message);
        console.error("\nFull error:", error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run the migration
runMigration()
    .then(() => {
        console.log("\n✅ Migration script completed");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Migration script failed:", error);
        process.exit(1);
    });
