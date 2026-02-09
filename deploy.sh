#!/bin/bash

# Stops script on error
set -e

echo "------------------------------------------------"
echo "🚀 Deploying Wabot BSP (Production)..."
echo "------------------------------------------------"

# 1. Check for .env file
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and fill in your values."
    exit 1
fi

# 2. Build and Start Containers
echo "📦 Building Docker containers..."
docker compose -f docker-compose.prod.yml up -d --build

# 3. Wait for DB to be ready
echo "⏳ Waiting for Database to initialize..."
sleep 15

# 4. Sync Database Schema
echo "🔗 Syncing Database Schema with Prisma..."
docker compose -f docker-compose.prod.yml exec web npx prisma db push

# 5. Generate Prisma Client (inside container)
echo "🛠️ Generating Prisma Client..."
docker compose -f docker-compose.prod.yml exec web npx prisma generate

# 6. Seed Admin User (if needed)
echo "👤 Seeding Admin User..."
docker compose -f docker-compose.prod.yml exec web npx tsx scripts/seed-admin.ts || echo "⚠️ Admin seeding failed or already exists."

# 7. Seed System Config
echo "⚙️ Seeding System Config..."
docker compose -f docker-compose.prod.yml exec web npx tsx scripts/seed-system-config.ts || echo "⚠️ System config seeding failed or already exists."

# 8. Seed Reseller Tiers
echo "📊 Seeding Reseller Tiers..."
docker compose -f docker-compose.prod.yml exec web npx tsx scripts/seed-reseller-api.ts || echo "⚠️ Reseller seeding failed or already exists."

echo ""
echo "------------------------------------------------"
echo "✅ Deployment Complete!"
echo "------------------------------------------------"
echo "App is running on port 3000."
echo "Check logs with: docker compose -f docker-compose.prod.yml logs -f"
echo "------------------------------------------------"
