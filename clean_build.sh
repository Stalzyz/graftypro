#!/bin/bash
set -e

echo "🔥 STARTING AGGRESSIVE CLEAN DEPLOY..."

# 1. Stop all containers & clean up
echo "🛑 Stopping containers..."
docker compose -f docker-compose.prod.yml down --remove-orphans || true

echo "🧹 Pruning Docker system (images, containers, build cache)..."
docker system prune -af --volumes

echo "🗑 removing old image explicitly..."
docker rmi -f grafty-app:latest || true

# 2. Build with NO CACHE
echo "🏗 Building new image --no-cache..."
docker build --no-cache -t grafty-app:latest .

# 3. Start containers
echo "🚀 Starting containers..."
docker compose -f docker-compose.prod.yml up -d

# 4. Verify running container
echo "✅ Checking running container..."
CONTAINER_ID=$(docker ps -qf "name=grafty_bsp-web-1")
if [ -z "$CONTAINER_ID" ]; then
    echo "❌ Container failed to start!"
    docker logs grafty_bsp-web-1
    exit 1
fi

echo "🔍 Verifying file content inside container..."
docker exec $CONTAINER_ID grep "bg-\[#F8F9FA\]" /app/app/\(auth\)/register/page.tsx || echo "⚠️  WARNING: New 'bg-[#F8F9FA]' NOT found in container!"
docker exec $CONTAINER_ID grep "Welcome back" /app/app/\(auth\)/login/page.tsx || echo "⚠️  WARNING: New 'Welcome back' NOT found in container!"

echo "🔄 Reloading Nginx..."
service nginx reload

echo "🎉 DEPLOYMENT COMPLETE. Please clear browser cache!"
