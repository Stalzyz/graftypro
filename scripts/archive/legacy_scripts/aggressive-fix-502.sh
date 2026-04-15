#!/bin/bash
# Aggressive 502 Fix: Kill, Prune, Rebuild, and Wait
# This script nukes everything and rebuilds from scratch to fix 502 errors.

SERVER="root@72.61.231.187"
REMOTE_PATH="/root/wabot_bsp"

echo "------------------------------------------------"
echo "☢️ Performing Nuclear Fix for 502 Bad Gateway"
echo "------------------------------------------------"

ssh $SERVER "bash -s" << 'EOF'
    cd /root/wabot_bsp
    
    echo "🛑 Stopping all containers..."
    docker compose -f docker-compose.prod.yml down --remove-orphans
    
    echo "🧹 Removing all unused containers, networks, and images (DANGER: Aggressive Prune)..."
    docker system prune -af --volumes
    
    echo "💀 Killing any process hogging port 3001..."
    fuser -k 3001/tcp || true
    
    echo "🏗️ Rebuilding containers from scratch (No Cache)..."
    docker compose -f docker-compose.prod.yml build --no-cache
    
    echo "🚀 Starting services..."
    docker compose -f docker-compose.prod.yml up -d
    
    echo "⏳ Waiting 30 seconds for full boot..."
    sleep 30
    
    # Verify it is running
    echo "🔍 Checking container status..."
    docker ps
    
    echo "📝 Checking logs for crash..."
    docker compose -f docker-compose.prod.yml logs --tail=50 web
    
    echo "✅ Nuclear Fix Complete. Check URL now."
EOF
