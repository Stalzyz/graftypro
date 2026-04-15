#!/bin/bash
SERVER="root@72.61.231.187"
REMOTE_PATH="/root/wabot_bsp"

if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "🔄 Syncing files..."
rsync -avz --no-perms --no-owner --no-group --exclude 'node_modules' --exclude '.next' --exclude '.git' --exclude '.DS_Store' --exclude '.npm_cache' ./ $SERVER:$REMOTE_PATH/

echo "🏗️ Restarting Containers (Soft)..."
ssh -o StrictHostKeyChecking=no $SERVER "cd $REMOTE_PATH && [ -f env_sync.txt ] && mv env_sync.txt .env && mkdir -p public/uploads && chmod -R 777 public/uploads && docker compose -f docker-compose.prod.yml up -d --build"

echo "🧪 Validating Prisma Client..."
ssh -o StrictHostKeyChecking=no $SERVER "docker exec grafty_bsp-web-1 npx tsx scripts/test-reseller.ts"

echo "✅ Soft Deploy Complete."
