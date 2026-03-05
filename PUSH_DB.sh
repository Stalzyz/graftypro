#!/bin/bash
# 🚀 DB Sync Script

SERVER="root@72.61.231.187"
PASSWORD="Photoshop09@"

echo "📡 Checking database tables on VPS..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "docker exec wabot_bsp-postgres-1 psql -U user -d grafty_bsp -c '\dt'"

echo "📊 Running Prisma DB Push..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cd /root/wabot_bsp && docker compose -f docker-compose.prod.yml exec -T web npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss"

echo "🛠️ Regenerating Prisma Client..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "cd /root/wabot_bsp && docker compose -f docker-compose.prod.yml exec -T web npx prisma generate --schema=./prisma/schema.prisma"

echo "📡 Final table check..."
sshpass -p "$PASSWORD" ssh -o StrictHostKeyChecking=no $SERVER "docker exec wabot_bsp-postgres-1 psql -U user -d grafty_bsp -c '\dt'"
