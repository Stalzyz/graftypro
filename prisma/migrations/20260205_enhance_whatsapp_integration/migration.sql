-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('DRAFT', 'VALIDATING', 'ACTIVE', 'DEGRADED', 'PAUSED', 'SUSPENDED', 'DISABLED', 'FAILED');

-- CreateEnum
CREATE TYPE "HealthStatus" AS ENUM ('HEALTHY', 'WARNING', 'CRITICAL', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "HealthCheckType" AS ENUM ('TOKEN_VALIDITY', 'WEBHOOK_REACHABILITY', 'PERMISSION_CHECK', 'PHONE_STATUS', 'RATE_LIMIT_CHECK', 'MESSAGE_DELIVERY', 'QUALITY_RATING');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('INTEGRATION_CREATED', 'CREDENTIALS_UPDATED', 'VALIDATION_STARTED', 'VALIDATION_PASSED', 'VALIDATION_FAILED', 'ACTIVATED', 'PAUSED', 'SUSPENDED', 'RESUMED', 'DELETED', 'WEBHOOK_VERIFIED', 'PERMISSION_GRANTED', 'PERMISSION_REVOKED', 'HEALTH_CHECK_FAILED');

-- AlterTable: Add new columns to whatsapp_accounts
ALTER TABLE "whatsapp_accounts" ADD COLUMN "integration_status" "IntegrationStatus" NOT NULL DEFAULT 'DRAFT';
ALTER TABLE "whatsapp_accounts" ADD COLUMN "health_status" "HealthStatus" NOT NULL DEFAULT 'UNKNOWN';
ALTER TABLE "whatsapp_accounts" ADD COLUMN "app_id" TEXT;
ALTER TABLE "whatsapp_accounts" ADD COLUMN "app_secret" TEXT;
ALTER TABLE "whatsapp_accounts" ADD COLUMN "business_id" TEXT;
ALTER TABLE "whatsapp_accounts" ADD COLUMN "webhook_url" TEXT;
ALTER TABLE "whatsapp_accounts" ADD COLUMN "webhook_verify_token" TEXT;
ALTER TABLE "whatsapp_accounts" ADD COLUMN "webhook_verified_at" TIMESTAMP(3);
ALTER TABLE "whatsapp_accounts" ADD COLUMN "granted_permissions" JSONB;
ALTER TABLE "whatsapp_accounts" ADD COLUMN "required_permissions" JSONB;
ALTER TABLE "whatsapp_accounts" ADD COLUMN "permission_check_at" TIMESTAMP(3);
ALTER TABLE "whatsapp_accounts" ADD COLUMN "last_health_check_at" TIMESTAMP(3);
ALTER TABLE "whatsapp_accounts" ADD COLUMN "last_successful_send_at" TIMESTAMP(3);
ALTER TABLE "whatsapp_accounts" ADD COLUMN "consecutive_failures" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "whatsapp_accounts" ADD COLUMN "rate_limit_tier" TEXT;
ALTER TABLE "whatsapp_accounts" ADD COLUMN "validated_at" TIMESTAMP(3);
ALTER TABLE "whatsapp_accounts" ADD COLUMN "suspended_at" TIMESTAMP(3);
ALTER TABLE "whatsapp_accounts" ADD COLUMN "suspension_reason" TEXT;

-- CreateTable: IntegrationHealthLog
CREATE TABLE "integration_health_logs" (
    "id" TEXT NOT NULL,
    "whatsapp_account_id" TEXT NOT NULL,
    "check_type" "HealthCheckType" NOT NULL,
    "status" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "error_message" TEXT,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_health_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable: IntegrationAuditLog
CREATE TABLE "integration_audit_logs" (
    "id" TEXT NOT NULL,
    "whatsapp_account_id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" "AuditAction" NOT NULL,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "integration_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "integration_health_logs_whatsapp_account_id_checked_at_idx" ON "integration_health_logs"("whatsapp_account_id", "checked_at");

-- CreateIndex
CREATE INDEX "integration_audit_logs_whatsapp_account_id_created_at_idx" ON "integration_audit_logs"("whatsapp_account_id", "created_at");

-- CreateIndex
CREATE INDEX "integration_audit_logs_workspace_id_created_at_idx" ON "integration_audit_logs"("workspace_id", "created_at");

-- AddForeignKey
ALTER TABLE "integration_health_logs" ADD CONSTRAINT "integration_health_logs_whatsapp_account_id_fkey" FOREIGN KEY ("whatsapp_account_id") REFERENCES "whatsapp_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integration_audit_logs" ADD CONSTRAINT "integration_audit_logs_whatsapp_account_id_fkey" FOREIGN KEY ("whatsapp_account_id") REFERENCES "whatsapp_accounts"("id") ON DELETE CASCADE ON UPDATE CASCADE;
