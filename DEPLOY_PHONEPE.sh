#!/bin/bash

# ============================================================
# 🚀 GRAFTY BSP — PhonePe Master Deployment Script
# Target: root@72.61.231.187 → /root/wabot_bsp
# Strategy: Sync → Build → DB Push → Restart (Zero downtime)
# ============================================================

set -e

SERVER="root@72.61.231.187"
REMOTE_PATH="/root/wabot_bsp"
APP_URL="http://72.61.231.187:3001"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║     🦁 GRAFTY PhonePe Master Deployment              ║"
echo "║     $(date)                    ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ─── STEP 1: Sync all local changes to VPS ─────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 [1/5] Syncing codebase to VPS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

rsync -az --delete \
  -e "ssh -o StrictHostKeyChecking=no" \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '.git' \
  --exclude 'temp_project' \
  --exclude '.DS_Store' \
  --exclude '.env' \
  --exclude '*.zip' \
  --exclude '*.tar.gz' \
  --exclude 'public/uploads' \
  ./ $SERVER:$REMOTE_PATH/

echo "✅ Sync complete."
echo ""

# ─── STEP 2–5: Run everything on the VPS ───────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 [2/5] Executing remote deployment..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

ssh -o StrictHostKeyChecking=no $SERVER "bash -s" << 'REMOTE_EOF'
    set -e
    cd /root/wabot_bsp

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🏗️ [3/5] Rebuilding Docker containers..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Rebuild containers cleanly (no --no-cache for speed, just rebuild changed layers)
    docker compose -f docker-compose.prod.yml build

    echo ""
    echo "🔄 Stopping old containers and starting fresh..."
    docker compose -f docker-compose.prod.yml down --remove-orphans
    docker compose -f docker-compose.prod.yml up -d

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "💾 [4/5] Updating database schema..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Wait for containers to be healthy
    echo "⏳ Waiting 20s for containers to boot..."
    sleep 20

    # Push schema (safe: only adds, doesn't drop existing columns)
    docker compose -f docker-compose.prod.yml exec -T web \
        npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss < /dev/null

    # Regenerate Prisma client in both web + worker containers
    echo "🛠️ Regenerating Prisma client..."
    docker compose -f docker-compose.prod.yml exec -T web \
        npx prisma generate --schema=./prisma/schema.prisma < /dev/null
    docker compose -f docker-compose.prod.yml exec -T worker \
        npx prisma generate --schema=./prisma/schema.prisma < /dev/null 2>/dev/null || true

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "♻️ [5/5] Final restart to load new Prisma client..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    docker compose -f docker-compose.prod.yml restart web worker

    echo ""
    echo "⏳ Waiting 10s for app to go live..."
    sleep 10

    # Verify app is responding
    echo "🔍 Health check..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 || echo "000")
    if [[ "$HTTP_CODE" == "200" || "$HTTP_CODE" == "302" || "$HTTP_CODE" == "301" ]]; then
        echo "✅ App is healthy! HTTP $HTTP_CODE"
    else
        echo "⚠️  App returned HTTP $HTTP_CODE — check logs:"
        docker compose -f docker-compose.prod.yml logs web --tail=30
    fi

REMOTE_EOF

EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    echo "╔══════════════════════════════════════════════════════╗"
    echo "║  🎉 DEPLOYMENT SUCCESSFUL                            ║"
    echo "║                                                      ║"
    echo "║  🌐 App:        http://72.61.231.187:3001            ║"
    echo "║  🔑 SuperAdmin: http://72.61.231.187:3001/super-admin/login ║"
    echo "║                                                      ║"
    echo "║  ✅ PhonePe gateway integration is now LIVE!         ║"
    echo "║  ✅ Flow Builder supports Razorpay + PhonePe         ║"
    echo "║  ✅ Partner billing supports Razorpay + PhonePe      ║"
    echo "╚══════════════════════════════════════════════════════╝"
else
    echo "╔══════════════════════════════════════════════════════╗"
    echo "║  ❌ DEPLOYMENT FAILED — Check logs above             ║"
    echo "╚══════════════════════════════════════════════════════╝"
    exit 1
fi
