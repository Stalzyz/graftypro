#!/bin/bash
# ============================================================
# 👹 HARD DEPLOY — Direct Sync & Force Rebuild
# ============================================================

VPS_HOST="root@72.61.231.187"
REMOTE_PATH="/root/wabot_bsp"
LOCAL_PATH="/Users/stalinkumar/Downloads/Grafty_Bsp"

echo "╔══════════════════════════════════════════════════════╗"
echo "║  👹 HARD DEPLOY — Syncing & Rebuilding               ║"
echo "╚══════════════════════════════════════════════════════╝"

# 1. Sync files with direct rsync (you might be asked for password once)
echo "📡 [1/2] Syncing project files to VPS..."
rsync -avz --no-perms --no-owner --no-group --delete \
    --exclude "node_modules" \
    --exclude ".next" \
    --exclude ".git" \
    --exclude ".DS_Store" \
    --exclude "public/uploads" \
    --exclude "logs" \
    -e "ssh -o StrictHostKeyChecking=no" \
    "$LOCAL_PATH/" $VPS_HOST:$REMOTE_PATH/

# 2. Remote commands for HARD REBUILD
echo "🏗️ [2/2] Running HARD REBUILD on VPS..."
ssh -o StrictHostKeyChecking=no $VPS_HOST << EOF
cd $REMOTE_PATH
echo '🛑 Stopping app containers...'
docker compose -f docker-compose.prod.yml down
echo '🧼 Removing old application images...'
docker rmi grafty-app:latest || true
echo '🏗️ Building from scratch (NO CACHE)...'
docker compose -f docker-compose.prod.yml build --no-cache
echo '🚀 Starting fresh containers...'
docker compose -f docker-compose.prod.yml up -d
sleep 5
echo '🔗 Pushing Prisma changes...'
docker compose -f docker-compose.prod.yml exec -T web npx prisma db push --accept-data-loss
echo '🌱 Seeding plans...'
docker compose -f docker-compose.prod.yml exec -T web npx tsx scripts/seed-monster-plans.ts
echo '✅ HARD DEPLOY COMPLETE!'
EOF
