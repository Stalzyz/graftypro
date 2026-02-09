#!/bin/bash

# 🚀 Wabot BSP: VPS Deployment Runner
# This script automates the sync and deployment of the Interactive Commerce Engine.

SERVER="root@72.61.231.187"
REMOTE_PATH="/root/wabot_bsp"

echo "------------------------------------------------"
echo "📦 Preparing Deployment: Interactive Commerce Engine"
echo "------------------------------------------------"

# 1. Sync files via rsync
echo "🔄 Syncing files to VPS ($SERVER)..."
echo "You may be asked for the VPS password (from scripts/pass.sh: Photoshop09@)"

rsync -avz --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude 'temp_project' \
    --exclude 'tmp_cache' \
    --exclude '*.zip' \
    --exclude '*.tar.gz' \
    ./ $SERVER:$REMOTE_PATH/

if [ $? -ne 0 ]; then
    echo "❌ Error: Sync failed. Please check your SSH connection."
    exit 1
fi

echo "✅ Sync Complete."

# 2. Run remote deployment commands
echo "🔧 Executing remote deployment commands..."
ssh $SERVER "bash -s" << 'EOF'
    cd /root/wabot_bsp
    
    # Update Prisma Client and DB
    echo "🛠️ Generating Prisma Client..."
    docker compose -f docker-compose.prod.yml exec -T web npx prisma generate
    
    echo "📊 Syncing Database Schema..."
    docker compose -f docker-compose.prod.yml exec -T web npx prisma db push --accept-data-loss
    
    # Restart services to apply new code
    echo "🏗️ Rebuilding & Restarting Containers..."
    docker compose -f docker-compose.prod.yml up -d --build
    
    echo "✨ Deployment Finished on Server!"
EOF

if [ $? -eq 0 ]; then
    echo "------------------------------------------------"
    echo "🎉 SUCCESS: Interactive Commerce Engine is LIVE!"
    echo "URL: http://72.61.231.187:3001"
    echo "------------------------------------------------"
else
    echo "❌ Error: Deployment failed during remote execution."
    exit 1
fi
