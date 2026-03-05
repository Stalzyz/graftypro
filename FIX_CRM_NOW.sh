#!/bin/bash

# Quick Fix Script for Sales War Room CRM Module
# This regenerates the Prisma client on the production server

SERVER="root@72.61.231.187"
REMOTE_PATH="/root/wabot_bsp"

echo "🔧 Fixing Sales War Room Module..."
echo "------------------------------------------------"

ssh -o StrictHostKeyChecking=no $SERVER "bash -s" <<'EOF'
    cd /root/wabot_bsp
    
    echo "📊 Regenerating Prisma Client..."
    docker compose -f docker-compose.prod.yml exec -T web npx prisma generate
    
    echo "🔄 Restarting Web Service..."
    docker compose -f docker-compose.prod.yml restart web
    
    echo "⏳ Waiting 10 seconds for service to boot..."
    sleep 10
    
    echo "✅ Fix Applied!"
EOF

if [ $? -eq 0 ]; then
    echo "------------------------------------------------"
    echo "🎉 SUCCESS: Sales War Room Should Now Work!"
    echo "Test URL: https://grafty.pro/super-admin/dashboard/crm"
    echo "------------------------------------------------"
else
    echo "❌ Error: Fix failed during remote execution."
    exit 1
fi
