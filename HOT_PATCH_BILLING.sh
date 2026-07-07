#!/bin/bash

# ☢️ HOT PATCH: Fix BILLING_ERROR Trial Limit for Enterprise Plan workspaces
# This does NOT do a full rebuild — it syncs only changed files and runs the DB fix.

SERVER="root@72.61.231.187"
REMOTE_PATH="/root/grafty_bsp"
SSH_OPTS="-F /dev/null -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null"

echo "=================================================="
echo "  ☢️  BILLING HOT PATCH — Targeted Fix Deploy"
echo "=================================================="

# STEP 1: Sync ONLY the patched credit service + fix script
echo ""
echo "📡 [1/3] Syncing patched files..."

rsync -avz $SSH_OPTS \
    /Users/stalinkumar/Downloads/Grafty_Bsp/lib/credits/service.ts \
    $SERVER:$REMOTE_PATH/lib/credits/service.ts

rsync -avz $SSH_OPTS \
    /Users/stalinkumar/Downloads/Grafty_Bsp/scripts/fix-enterprise-billing.ts \
    $SERVER:$REMOTE_PATH/scripts/fix-enterprise-billing.ts

echo "✅ Files synced."

# STEP 2: Run DB fix first (instant — no rebuild needed)
echo ""
echo "🗄️  [2/3] Running DB Enterprise Billing Fix..."
ssh $SSH_OPTS $SERVER "cd $REMOTE_PATH && docker compose -f docker-compose.prod.yml exec -T web npx tsx scripts/fix-enterprise-billing.ts < /dev/null"

echo "✅ DB fix complete."

# STEP 3: Rebuild ONLY the web + worker containers with the patched file
# (skipping full --no-cache to use layer cache for speed — only changed source files trigger a layer bust)
echo ""
echo "🏗️  [3/3] Hot-rebuilding web + worker with patched billing service..."
ssh $SSH_OPTS $SERVER "cd $REMOTE_PATH && \
    docker compose -f docker-compose.prod.yml build web worker && \
    docker compose -f docker-compose.prod.yml up -d --force-recreate web worker && \
    echo '✅ Containers restarted.' && \
    sleep 5 && \
    docker compose -f docker-compose.prod.yml logs --tail=30 web"

echo ""
echo "=================================================="
echo "  🎉 HOT PATCH COMPLETE!"
echo "  Live Chat + Broadcast should now work for Enterprise plan."
echo "  URL: http://72.61.231.187:3001"
echo "=================================================="
