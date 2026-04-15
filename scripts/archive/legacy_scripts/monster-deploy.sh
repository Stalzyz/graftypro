#!/bin/bash
set -e # Exit immediately if a command exits with a non-zero status.

# CONFIG
SERVER="root@72.61.231.187"
REMOTE_PATH="/root/grafty_bsp"

echo "🦖 STARTING MONSTER DEPLOYMENT..."
echo "Date: $(date)"

# 1. Update Version file locally to force cache bust
date > public/deploy_version.txt

echo "📡 Syncing files to VPS (PROD)..."
# -a: archive mode, -v: verbose, -z: compress, -c: checksum (slower but safer), -P: progress
# We exclude node_modules to sync faster (reinstall on server)
# We exclude .next to force rebuild on server
# We EXCLUDE .env to avoid overwriting production secrets with local .env if present (Safety first)
# If you NEED to update env vars, copy .env manually or remove this exclusion.
rsync -avzc -P --exclude 'node_modules' --exclude '.next' --exclude '.git' --exclude '.npm-cache' ./ $SERVER:$REMOTE_PATH/

echo "✅ File sync complete."

echo "🔥 Executing Remote Rebuild..."
ssh $SERVER "bash -s" << 'EOF'
    set -e
    cd /root/grafty_bsp
    
    echo "📂 verifying uploads directory..."
    mkdir -p public/uploads
    chmod 777 public/uploads
    
    echo "🛑 Nuclear Cleanup of existing containers and ports..."
    # Kill any process on port 3001 (Host level ghost processes)
    fuser -k 3001/tcp 2>/dev/null || true
    
    # Force remove known conflicting containers (including auto-generated names)
    docker rm -f grafty_redis grafty_postgres grafty_web grafty_worker 2>/dev/null || true
    docker rm -f $(docker ps -aq --filter name=grafty) 2>/dev/null || true
    docker rm -f $(docker ps -aq --filter name=wabot) 2>/dev/null || true
    
    # Standard compose cleanup
    docker compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
    
    echo "🧹 Cleaning up old docker artifacts..."
    docker system prune -f
    
    echo "🏗️ FORCED Rebuild of Containers..."
    # --no-cache ensures we don't use old layers
    docker compose -f docker-compose.prod.yml build --no-cache
    
    echo "🚀 Starting new containers..."
    docker compose -f docker-compose.prod.yml up -d
    
    echo "⏳ Waiting 15s for Database to be ready..."
    sleep 15
    
    echo "💾 Pushing Database Schema..."
    # Ensure DB schema matches code
    docker compose -f docker-compose.prod.yml exec -T web npx prisma db push --accept-data-loss
    
    echo "🔄 Generating Prisma Client..."
    docker compose -f docker-compose.prod.yml exec -T web npx prisma generate
    
    echo "☢️ RUNNING NUCLEAR SYSTEM FIX..."
    docker compose -f docker-compose.prod.yml exec -T web npx tsx scripts/nuclear-fix.ts
    
    echo "🔐 FORCING ADMIN RECOVERY..."
    docker compose -f docker-compose.prod.yml exec -T web npx tsx scripts/fix-admin-access.ts
    
    echo "♻️ Final Restart to load new client..."
    docker compose -f docker-compose.prod.yml restart web worker
    
    echo "🦖 MONSTER DEPLOY FINISHED SUCCESSFULLY!"
EOF
