CREATE TABLE IF NOT EXISTS "email_campaigns" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "html_content" TEXT,
    "filters" JSONB NOT NULL,
    "scheduled_at" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "email_campaigns_pkey" PRIMARY KEY ("id")
);
CREATE TABLE IF NOT EXISTS "email_campaign_stats" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "total" INTEGER NOT NULL DEFAULT 0,
    "sent" INTEGER NOT NULL DEFAULT 0,
    "delivered" INTEGER NOT NULL DEFAULT 0,
    "opened" INTEGER NOT NULL DEFAULT 0,
    "clicked" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "email_campaign_stats_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "email_campaign_stats_campaign_id_key" ON "email_campaign_stats"("campaign_id");
CREATE TABLE IF NOT EXISTS "email_unsubscribers" (
    "id" TEXT NOT NULL,
    "workspace_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "email_unsubscribers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "email_unsubscribers_workspace_id_email_key" ON "email_unsubscribers"("workspace_id", "email");

ALTER TABLE "email_campaigns" DROP CONSTRAINT IF EXISTS "email_campaigns_workspace_id_fkey";
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "email_campaign_stats" DROP CONSTRAINT IF EXISTS "email_campaign_stats_campaign_id_fkey";
ALTER TABLE "email_campaign_stats" ADD CONSTRAINT "email_campaign_stats_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "email_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "email_unsubscribers" DROP CONSTRAINT IF EXISTS "email_unsubscribers_workspace_id_fkey";
ALTER TABLE "email_unsubscribers" ADD CONSTRAINT "email_unsubscribers_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;
