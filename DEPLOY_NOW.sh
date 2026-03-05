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
    --exclude '.env' \
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
    
    # --- ☢️ AGGRESSIVE NUCLEAR MODE: Wipe & Force Rebuild ---
    echo "☢️ EXECUTING AGGRESSIVE NUCLEAR MODE..."
    
    # 1. Stop and remove EVERYTHING related to this project
    docker compose -f docker-compose.prod.yml down --volumes --remove-orphans || true
    
    # 2. Wipe local build caches and Next.js artifacts on the host
    echo "🧹 Wiping host-side build artifacts..."
    rm -rf .next node_modules prisma/client
    
    # 3. Docker System Prune (Aggressive)
    echo "🗑️ Purging dangling Docker images and build cache..."
    docker image prune -af
    docker builder prune -af
    
    # 4. Force clear port 3001
    fuser -k 3001/tcp || true
    
    # Pre-cleanup of legacy structures
    echo "🧹 Cleaning up legacy structures..."
    rm -rf app/reseller/account app/reseller/billing app/reseller/branding app/reseller/dashboard app/reseller/domains app/reseller/payouts app/reseller/layout.tsx
    rm -rf app/white-label/dashboard app/white-label/layout.tsx
    rm -rf app/super-admin/settings app/super-admin/branding app/super-admin/email
    
    # Restart services from absolute zero with NO CACHE
    echo "🏗️ Rebuilding & Starting Fresh Containers from ZERO (NO-CACHE)..."
    docker compose -f docker-compose.prod.yml build --no-cache
    docker compose -f docker-compose.prod.yml up -d --force-recreate
    
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

    # � Seeding Super Admin
    echo "🔐 Seeding Super Admin..."
    docker cp /tmp/reset_superadmin.js wabot_bsp-web-1:/app/reset_superadmin.js < /dev/null 2>/dev/null && \
    docker exec wabot_bsp-web-1 node /app/reset_superadmin.js < /dev/null 2>/dev/null || echo "⚠️ Super admin seed skipped"
    
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
