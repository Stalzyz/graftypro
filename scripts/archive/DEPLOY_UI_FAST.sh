#!/bin/bash
# ⚡ Grafty BSP: RAPID UI DEPLOY
# This script is a faster version of DEPLOY_NOW.sh focusing on UI/Logic changes.

SERVER="root@72.61.231.187"
REMOTE_PATH="/root/wabot_bsp"

# 1. Sync
echo "🔄 Syncing UI changes..."
rsync -avz --no-perms --no-owner --no-group \
    --exclude "node_modules" \
    --exclude ".next" \
    --exclude ".git" \
    --exclude ".DS_Store" \
    --exclude "public/uploads" \
    -e "ssh -o StrictHostKeyChecking=no" \
    ./ $SERVER:$REMOTE_PATH/

# 2. Remote Build (Cached)
echo "🏗️ Building on VPS..."
ssh -o StrictHostKeyChecking=no $SERVER "cd $REMOTE_PATH && docker compose -f docker-compose.prod.yml build && docker compose -f docker-compose.prod.yml up -d"

echo "✨ UI DEPLOY FINISHED!"
