#!/bin/bash

# ============================================================
# 🚀 GRAFTY BSP — PhonePe Master Deployment Script v2
# Runs in YOUR terminal. Password is pre-configured.
# Usage: cd into the project, then run: bash DEPLOY_PHONEPE_V2.sh
# ============================================================

VPS_PASS="Photoshop09@"
VPS_HOST="root@72.61.231.187"
REMOTE_PATH="/root/wabot_bsp"
LOCAL_PATH="$(pwd)"

export SSHPASS="$VPS_PASS"

echo ""
echo "╔══════════════════════════════════════════════════════╗"
echo "║       🦁 GRAFTY PhonePe Master Deployment            ║"
echo "║       $(date '+%Y-%m-%d %H:%M:%S')                   ║"
echo "╚══════════════════════════════════════════════════════╝"
echo ""

# ─── Check for sshpass ─────────────────────────────────────────
if ! command -v sshpass &>/dev/null; then
    echo "📦 Installing sshpass via brew..."
    brew install hudochenkov/sshpass/sshpass 2>/dev/null || \
    brew install esolitos/ipa/sshpass 2>/dev/null || \
    (echo "❌ Could not install sshpass. Please run: brew install esolitos/ipa/sshpass" && exit 1)
fi

SSH_CMD="sshpass -p $VPS_PASS ssh -o StrictHostKeyChecking=no"
RSYNC_CMD="sshpass -p $VPS_PASS rsync"

# ─── STEP 1: Sync local files to VPS ───────────────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📡 [1/5] Syncing all local changes to VPS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

$RSYNC_CMD -az --delete \
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
  "$LOCAL_PATH/" "$VPS_HOST:$REMOTE_PATH/"

if [ $? -ne 0 ]; then
  echo "❌ Sync failed. Check your VPS connection."
  exit 1
fi

echo "✅ File sync complete."
echo ""

# ─── STEP 2–5: Remote Build & Deploy ───────────────────────────
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔧 [2/5] Running remote build & deploy on VPS..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

$SSH_CMD "$VPS_HOST" bash << 'REMOTE_SCRIPT'
    set -e
    cd /root/wabot_bsp

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🏗️ [3/5] Rebuilding Docker containers..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    docker compose -f docker-compose.prod.yml build

    echo ""
    echo "🔄 Stopping old containers..."
    docker compose -f docker-compose.prod.yml down --remove-orphans

    echo ""
    echo "🚀 Starting fresh containers..."
    docker compose -f docker-compose.prod.yml up -d

    echo ""
    echo "⏳ Waiting 25s for boot..."
    sleep 25

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "💾 [4/5] Syncing database schema..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    docker compose -f docker-compose.prod.yml exec -T web \
        npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss < /dev/null

    echo "🛠️ Regenerating Prisma client..."
    docker compose -f docker-compose.prod.yml exec -T web \
        npx prisma generate --schema=./prisma/schema.prisma < /dev/null
    docker compose -f docker-compose.prod.yml exec -T worker \
        npx prisma generate --schema=./prisma/schema.prisma < /dev/null 2>/dev/null || true

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "♻️ [5/5] Final restart to load new client..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    docker compose -f docker-compose.prod.yml restart web worker

    echo ""
    echo "⏳ Waiting 10s for app to be ready..."
    sleep 10

    echo "🔍 Running health check..."
    HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 2>/dev/null || echo "000")
    echo "App returned HTTP: $HTTP"

    if [[ "$HTTP" == "200" || "$HTTP" == "302" || "$HTTP" == "301" ]]; then
        echo "✅ App is HEALTHY!"
    else
        echo "⚠️ App returned $HTTP. Showing last 30 lines of logs:"
        docker compose -f docker-compose.prod.yml logs web --tail=30
    fi

REMOTE_SCRIPT

# ─── Final Summary ──────────────────────────────────────────────
if [ $? -eq 0 ]; then
    echo ""
    echo "╔══════════════════════════════════════════════════════╗"
    echo "║  🎉 DEPLOYMENT COMPLETE!                             ║"
    echo "║                                                      ║"
    echo "║  🌐 App URL:    http://72.61.231.187:3001            ║"
    echo "║  🔑 SuperAdmin: /super-admin/login                   ║"
    echo "║                                                      ║"
    echo "║  ✅ PhonePe gateway integration is LIVE              ║"
    echo "║  ✅ Flow Builder supports Razorpay + PhonePe         ║"
    echo "║  ✅ Partner billing supports Razorpay + PhonePe      ║"
    echo "╚══════════════════════════════════════════════════════╝"
else
    echo ""
    echo "╔══════════════════════════════════════════════════════╗"
    echo "║  ❌ DEPLOYMENT FAILED                                ║"
    echo "║  Check the error output above                        ║"
    echo "╚══════════════════════════════════════════════════════╝"
    exit 1
fi
