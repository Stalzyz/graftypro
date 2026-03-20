#!/bin/bash
# ULTIMATE NUCLEAR FIX - Run this directly on the VPS
# Usage: Copy-paste the SSH command below into your terminal

set -e

echo "☢️  NUCLEAR FIX - STARTING..."
cd /root/wabot_bsp

echo "🔥 STEP 1: Wiping all Docker containers..."
docker stop $(docker ps -aq) 2>/dev/null || true
docker rm $(docker ps -aq) 2>/dev/null || true

echo "🌐 STEP 2: Pruning all networks..."
docker network prune -f 2>/dev/null || true

echo "🗑️  STEP 3: Pruning unused images to force clean rebuild..."
docker rmi grafty-app:nuclear 2>/dev/null || true
docker rmi grafty-app:latest 2>/dev/null || true

echo "🏗️  STEP 4: Rebuilding with clean network..."
docker compose -f docker-compose.prod.yml up -d --build --remove-orphans

echo "⏳ STEP 5: Waiting 20 seconds for Postgres to initialize..."
sleep 20

echo "🩺 STEP 6: Checking Postgres health..."
docker exec grafty_postgres_isolated pg_isready -U user -d grafty_bsp

echo "🔗 STEP 7: Verifying network connectivity from web to DB..."
WEB_CONTAINER=$(docker ps --filter name=web --format '{{.Names}}' | head -1)
echo "   Web container: $WEB_CONTAINER"
docker exec $WEB_CONTAINER ping -c 2 grafty_nuclear_db 2>/dev/null || \
  echo "   (ping not available, checking via prisma...)"

echo "🗄️  STEP 8: Running Prisma schema push..."
docker exec $WEB_CONTAINER npx prisma db push

echo "📋 STEP 9: Final container status..."
docker ps

echo ""
echo "✅ DONE! Check https://grafty.pro/api/auth/debug-login"
