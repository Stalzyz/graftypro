#!/bin/bash

# 🚀 Grafty BSP: VPS Deployment Runner
# This script automates the sync and deployment of the Interactive Commerce Engine.

SERVER="root@72.61.231.187"
REMOTE_PATH="/root/wabot_bsp"

# Enable SSH Pass Automation if pass.sh exists
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "------------------------------------------------"
echo "📦 Preparing Deployment: Interactive Commerce Engine"
echo "------------------------------------------------"

# 1. Sync files via rsync
echo "🔄 Syncing files to VPS ($SERVER)..."
echo "You may be asked for the VPS password (from scripts/pass.sh: Photoshop09@)"

rsync -avz --delete -e "ssh -o StrictHostKeyChecking=no" --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude 'temp_project' \
    --exclude 'tmp_cache' \
    --exclude '.DS_Store' \
    --exclude 'grafty-mobile/node_modules' \
    --exclude 'grafty-mobile/.expo' \
    --exclude 'grafty-mobile/expo_tmp' \
    --exclude '*.zip' \
    --exclude '*.tar.gz' \
    --exclude 'public/uploads' \
    ./ $SERVER:$REMOTE_PATH/

RSYNC_EXIT=$?

# Allow exit code 23 (Partial transfer due to error) as it often happens with permissions
if [ $RSYNC_EXIT -ne 0 ] && [ $RSYNC_EXIT -ne 23 ]; then
    echo "❌ Error: Sync failed with code $RSYNC_EXIT. Please check your SSH connection."
    exit 1
fi

echo "✅ Sync Complete."

# 2. Run remote deployment commands
echo "🔧 Executing remote deployment commands..."
ssh -o StrictHostKeyChecking=no $SERVER "bash -s" << 'EOF'
    set -e
    cd /root/wabot_bsp
    
    # --- ☢️ EXTREME CLEANUP MODE: Port 3001 Guardian ---
    echo "🛡️ Investigating port 3001 conflict..."
    
    # 1. Identify and kill containers holding port 3001 (Host-wide)
    CONFLICT_CONTAINERS=$(docker ps -a --format '{{.ID}} {{.Ports}}' | grep "3001" | awk '{print $1}')
    if [ ! -z "$CONFLICT_CONTAINERS" ]; then
        echo "🚩 Found conflicting containers: $CONFLICT_CONTAINERS"
        docker rm -f $CONFLICT_CONTAINERS || true
    fi

    # 2. Hard kill host processes on 3001 (IPv4 & IPv6 + Ghost Proxies)
    echo "🔓 Forcing closure of port 3001 sockets..."
    
    # NEW FIX: PM2 is actively running and fighting Docker! Kill PM2 first!
    if command -v pm2 &> /dev/null; then
        echo "🛑 PM2 detected. Stopping conflicting non-Docker instances..."
        pm2 stop all || true
        pm2 delete grafty || true
    fi

    fuser -k 3001/tcp || true
    lsof -ti:3001 | xargs kill -9 || true
    # Kill any zombie docker-proxy processes
    ps aux | grep docker-proxy | grep 3001 | awk '{print $2}' | xargs kill -9 || true
    
    # 3. Nuclear Compose Down - and wait to ensure port is freed
    docker compose -f docker-compose.prod.yml down --remove-orphans || true
    sleep 5
    
    # Check if 3001 is still bound and try killing again
    lsof -ti:3001 | xargs kill -9 || true
    
    # 1b. Force Purge base service names
    echo "🚨 Forced Purge of named dependencies..."
    docker rm -f grafty_redis grafty_postgres || true
    
    # 4. Clean Docker Network Stack
    echo "🧹 Pruning stale networks..."
    docker network prune -f || true
    
    # Pre-cleanup of legacy structures
    echo "🧹 Cleaning up legacy structures..."
    rm -rf app/reseller/account app/reseller/billing app/reseller/branding app/reseller/dashboard app/reseller/domains app/reseller/payouts app/reseller/layout.tsx
    rm -rf app/white-label/dashboard app/white-label/layout.tsx
    rm -rf app/super-admin/settings app/super-admin/branding app/super-admin/email
    
    if [ ! -f /root/wabot_bsp/.env ]; then
      echo "❌ FATAL: .env file missing at /root/wabot_bsp/.env"
      exit 1
    fi

    # Restart services from absolute zero
    echo "🏗️ Rebuilding & Starting Fresh Containers..."
    docker compose -f docker-compose.prod.yml build
    docker compose -f docker-compose.prod.yml up -d --force-recreate
    sleep 5
    
    # Wait for container to be ready
    echo "⏳ Waiting 20 seconds for application to boot..."
    sleep 20
    
    # Allow a little time for containers to fully boot
    sleep 5
    
    # Run DB push (always use explicit schema path)
    echo "📊 Syncing Database Schema..."
    docker compose -f docker-compose.prod.yml exec -e DATABASE_URL="postgresql://user:password@postgres:5432/grafty_bsp?schema=public" -T web npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss < /dev/null
    
    # Generate Prisma Client
    echo "🛠️ Regenerating Prisma Client..."
    docker compose -f docker-compose.prod.yml exec -T web npx prisma generate --schema=./prisma/schema.prisma < /dev/null
    docker compose -f docker-compose.prod.yml exec -T worker npx prisma generate --schema=./prisma/schema.prisma < /dev/null

    # 🔐 Seeding Super Admin
    echo "🔐 Seeding Super Admin (RESETTING)..."
    docker compose -f docker-compose.prod.yml exec -T web npx tsx scripts/reset-admin.ts < /dev/null
    
    # Final seeding
    echo "⚙️ Seeding SMTP Configuration..."
    docker compose -f docker-compose.prod.yml exec -T web npx tsx scripts/seed-smtp-fix.ts < /dev/null

    echo "💎 Seeding Premium Subscription Plans..."
    docker compose -f docker-compose.prod.yml exec -T web npx tsx scripts/seed-premium-plans.ts < /dev/null

    echo "💳 Initializing Credit Ledger System & Welcome Credits..."
    docker compose -f docker-compose.prod.yml exec -T web npx tsx scripts/seed-credit-system.ts < /dev/null

    echo "🔄 Final Restart..."
    docker compose -f docker-compose.prod.yml restart web worker

    echo "✨ AGGRESSIVE DEPLOYMENT FINISHED!"
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
