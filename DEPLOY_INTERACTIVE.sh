#!/bin/bash

# 🚀 Grafty BSP: VPS Deployment Runner (Interactive)
# This script will prompt for password during deployment

SERVER="root@72.61.231.187"
REMOTE_PATH="/root/grafty_bsp"

echo "------------------------------------------------"
echo "📦 Preparing Deployment: Interactive Commerce Engine"
echo "------------------------------------------------"
echo ""
echo "⚠️  You will be prompted for the VPS password multiple times."
echo "    Password: Photoshop09@"
echo ""
read -p "Press Enter to continue..."

# 1. Sync files via rsync
echo "🔄 Syncing files to VPS ($SERVER)..."

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
ssh $SERVER "bash -s" <<'EOF'
    cd /root/grafty_bsp
    
    # --- NUCLEAR FIX: Force clear port 3001 ---
    echo "☢️ Performing Nuclear Fix: Force-clearing port 3001..."
    
    # 1. Stop compose
    docker compose -f docker-compose.prod.yml down --remove-orphans
    
    # 2. Kill any ghost processes on 3001
    fuser -k 3001/tcp || true
    
    # 3. Stop ANY container using 3001 (fallback)
    GHOST_CID=$(docker ps -q --filter "publish=3001")
    if [ ! -z "$GHOST_CID" ]; then
        echo "🛑 Killing ghost container: $GHOST_CID"
        docker stop $GHOST_CID && docker rm $GHOST_CID
    fi

    # Restart services
    echo "🏗️ Rebuilding & Starting Fresh Containers..."
    docker compose -f docker-compose.prod.yml up -d --build
    
    # Wait for container to be ready
    echo "⏳ Waiting 15 seconds for application to boot..."
    sleep 15
    
    # Run DB push
    echo "📊 Syncing Database Schema..."
    docker compose -f docker-compose.prod.yml exec -T web npx prisma db push --accept-data-loss
    
    echo "✨ Deployment Finished Successfully!"
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
