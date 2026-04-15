#!/bin/bash

# Full Deployment Script for Grafty BSP
# Syncs all new features: Feedback System, Training Academy, Localized Landing Page
# Run from LOCAL machine: ./scripts/vps-deploy.sh

SERVER="root@72.61.231.187"
REMOTE_PATH="/root/grafty_bsp"

echo "🚀 Starting Full Deployment to VPS..."
echo "======================================"

# 1. Pre-sync validation
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Error: Run from project root."
    exit 1
fi

echo "📦 Step 1: Syncing all code and components..."
# We use rsync to efficiently update the server while excluding heavy/temp directories
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' --exclude '.npm-cache' \
    ./ $SERVER:$REMOTE_PATH/

echo "✅ Code sync complete."

echo "🔧 Step 2: Server-side build and migrations..."
ssh $SERVER "bash -s" << 'EOF'
    cd /root/grafty_bsp
    
    # Ensure clean state to prevent container name conflicts (e.g., grafty_redis, grafty_postgres)
    echo "🛑 Stopping existing containers..."
    docker compose -f docker-compose.prod.yml down --remove-orphans || true
    docker rm -f grafty_redis grafty_postgres || true
    
    # Rebuild with new code
    echo "🏗️ Rebuilding Docker containers..."
    docker compose -f docker-compose.prod.yml up -d --build
    
    echo "⏳ Waiting for services..."
    sleep 5
    
    echo "📊 Syncing Database Schema..."
    docker compose -f docker-compose.prod.yml exec -T web npx prisma db push --accept-data-loss
    
    echo "🛠️ Generating Prisma Client..."
    docker compose -f docker-compose.prod.yml exec -T web npx prisma generate
    
    echo "🔄 Rolling restart for safety..."
    docker compose -f docker-compose.prod.yml restart web worker
    
    echo "✨ All server-side tasks finished!"
EOF

echo "======================================"
echo "🎉 DEPLOYMENT SUCCESSFUL!"
echo "Grafty is now live with the new features."
echo "URL: http://72.61.231.187:3001 (or your custom domain)"
echo "======================================"
