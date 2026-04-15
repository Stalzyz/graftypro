#!/bin/bash

# ☢️ Nuclear Fix: Force-clears everything and rebuilds from scratch
# This script uses the SSH_ASKPASS technique from DEPLOY_NOW.sh

SERVER="root@72.61.231.187"
REMOTE_PATH="/root/grafty_bsp"

# Enable SSH Pass Automation
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    # We use a dummy DISPLAY for SSH_ASKPASS to work in some environments
    export DISPLAY=:0 
fi

echo "------------------------------------------------"
echo "☢️ STARTING NUCLEAR FIX FOR 502 BAD GATEWAY"
echo "------------------------------------------------"

echo "📦 Pushing latest local code to server..."
rsync -avz --delete --exclude='.git' --exclude='node_modules' --exclude='.next' \
    /Users/stalinkumar/Downloads/Grafty_Bsp/ $SERVER:$REMOTE_PATH/

# Run remote commands
ssh $SERVER "bash -s" << 'EOF'
    cd /root/grafty_bsp
    
    echo "🛑 Stopping all containers..."
    docker compose -f docker-compose.prod.yml down --remove-orphans
    
    echo "🧹 Clean Prune: Removing all images, containers, and volumes..."
    docker system prune -af --volumes
    
    echo "💀 Killing any process on port 3001..."
    fuser -k 3001/tcp || true
    
    echo "🏗️ Rebuilding containers with NO CACHE..."
    docker compose -f docker-compose.prod.yml build --no-cache
    
    echo "🚀 Starting services..."
    docker compose -f docker-compose.prod.yml up -d
    
    echo "⏳ Waiting 30 seconds for application to boot..."
    sleep 30
    
    echo "📊 Running Database Sync..."
    docker compose -f docker-compose.prod.yml exec -T web npx prisma db push --accept-data-loss
    
    echo "🔍 Checking container health..."
    docker ps
    
    echo "📝 Fetching logs for web container..."
    docker compose -f docker-compose.prod.yml logs --tail=100 web
    
    echo "✨ Nuclear Fix Finished!"
EOF

echo "------------------------------------------------"
echo "✅ NUCLEAR FIX COMPLETE"
echo "Check: https://grafty.pro"
echo "------------------------------------------------"
