#!/bin/bash

# FORCE Prisma Schema Update on Production
# This ensures the schema is fresh and Prisma client is fully regenerated

SERVER="root@72.61.231.187"
REMOTE_PATH="/root/wabot_bsp"

echo "🔄 FORCING Prisma Schema Update..."
echo "------------------------------------------------"

# Enable SSH Pass Automation if pass.sh exists (copied from DEPLOY_NOW.sh)
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

# First, explicitly sync ONLY the Prisma folder
echo "📤 Uploading fresh Prisma schema..."
rsync -avz -e "ssh -o StrictHostKeyChecking=no" \
    ./prisma/ $SERVER:$REMOTE_PATH/prisma/

# Then regenerate everything on the server
ssh -o StrictHostKeyChecking=no $SERVER "bash -s" <<'EOF'
    cd /root/wabot_bsp
    
    echo "🗑️  Removing old Prisma client..."
    docker compose -f docker-compose.prod.yml exec -T web rm -rf node_modules/.prisma
    docker compose -f docker-compose.prod.yml exec -T web rm -rf node_modules/@prisma/client
    
    echo "📊 Regenerating Prisma Client from FRESH schema..."
    docker compose -f docker-compose.prod.yml exec -T web npx prisma generate --schema=./prisma/schema.prisma
    
    echo "🔄 Restarting services..."
    docker compose -f docker-compose.prod.yml restart web worker
    
    echo "⏳ Waiting 10 seconds for service to boot..."
    sleep 10
    
    echo "✅ Prisma Schema Force Update Complete!"
EOF

if [ $? -eq 0 ]; then
    echo "------------------------------------------------"
    echo "🎉 SUCCESS!"
    echo "Test URL: https://grafty.pro/api/diagnostic/prisma"
    echo "Expected: hasCRMLead should now be TRUE"
    echo "------------------------------------------------"
else
    echo "❌ Error: Force update failed."
    exit 1
fi
