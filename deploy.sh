#!/bin/bash

# Stops script on error
set -e

echo "🚀 Deploying Wabot BSP..."

# 1. Build and Start Containers
echo "Building Docker containers..."
docker compose -f docker-compose.prod.yml up -d --build

# 2. Wait for DB
echo "Waiting for Database to initialize..."
sleep 10

# 3. Push Prisma Schema to Production DB
echo "Syncing Database Schema..."
docker compose -f docker-compose.prod.yml exec -u root web npx prisma db push

echo "✅ Deployment Complete!"
echo "App is running on http://your-ip:3000"
