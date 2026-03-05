#!/bin/bash
set -e

# CONFIG
SERVER="root@72.61.231.187"
REMOTE_PATH="/root/grafty_bsp"

echo "🦖 RESTARTING MONSTER DEPLOYMENT (Port Fix)..."

echo "🔥 Stopping and Resetting Containers on Server..."
ssh $SERVER "bash -s" << 'EOF'
    set -e
    cd /root/grafty_bsp
    
    echo "💀 Stopping everything..."
    docker compose -f docker-compose.prod.yml down --remove-orphans
        
    echo "🧹 Clean start..."
    docker compose -f docker-compose.prod.yml up -d postgres redis
    
    echo "⏳ Waiting for DB to be healthy (30s)..."
    sleep 30
    
    echo "🏗️ Starting Web & Worker..."
    docker compose -f docker-compose.prod.yml up -d web worker

    echo "💾 Pushing Schema..."
    # Ensure DB schema matches code
    docker compose -f docker-compose.prod.yml exec -T web npx prisma db push --accept-data-loss
    
    echo "🔄 Generating Prisma Client..."
    docker compose -f docker-compose.prod.yml exec -T web npx prisma generate

    echo "♻️ Final Restart..."
    docker compose -f docker-compose.prod.yml restart web worker
    
    echo "🦖 PORT FIX APPLIED & DEPLOY SUCCESSFUL!"
EOF
