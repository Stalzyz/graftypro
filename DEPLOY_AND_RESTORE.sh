#!/bin/bash
# ============================================================
# ONE-SHOT DEPLOY & RESTORE SCRIPT (v2)
# ============================================================

SERVER="root@72.61.231.187"

echo "🚀 Starting Deployment Process..."

echo ""
echo "=== [1/5] Pushing updated code to server ==="
rsync -avz --delete --exclude='.git' --exclude='node_modules' --exclude='.next' \
    /Users/stalinkumar/Downloads/Wabot_BSP/ $SERVER:/root/grafty_bsp/

echo ""
echo "=== [2/5] Rebuilding the Docker image (no cache) ==="
ssh $SERVER "cd /root/grafty_bsp && docker compose -f docker-compose.prod.yml build --no-cache web"

echo ""
echo "=== [3/5] Starting services with force-recreate ==="
ssh $SERVER "cd /root/grafty_bsp && docker compose -f docker-compose.prod.yml up -d --force-recreate"

echo ""
echo "=== [4/5] Waiting for Database and App to be healthy ==="
sleep 15 # Give time for container startup

echo ""
echo "=== [5/5] Running Internal Reset and Seeding ==="
ssh $SERVER "cd /root/grafty_bsp && \
    docker compose -f docker-compose.prod.yml exec -T web npx prisma db push --accept-data-loss && \
    docker compose -f docker-compose.prod.yml exec -T web npx -y tsx scripts/seed-admin.ts && \
    docker compose -f docker-compose.prod.yml exec -T web npx -y tsx scripts/seed-official-plans.ts"

echo ""
echo "============================================"
echo "✅ DEPLOYMENT & SEEDING COMPLETED!"
echo "--------------------------------------------------------"
echo "Login: https://grafty.pro/super-admin/dashboard/packages"
echo "Note: If plans are still empty, check the output above for '❌ Failed' messages."
echo "============================================"
