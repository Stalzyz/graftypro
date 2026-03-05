#!/bin/bash

# ☢️ NUCLEAR AUTH & SMTP FIX ☢️
# This script forces a schema sync and resets all administrative access levels.

SERVER="root@72.61.231.187"
REMOTE_PATH="/root/wabot_bsp"

# Enable SSH Pass Automation if pass.sh exists
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "------------------------------------------------"
echo "☢️ RUNNING NUCLEAR AUTH FIX..."
echo "------------------------------------------------"

# 1. Upload the fix scripts
echo "📤 Uploading fix scripts & schema..."
scp prisma/schema.prisma $SERVER:$REMOTE_PATH/prisma/schema.prisma
scp scripts/nuclear-fix.ts $SERVER:$REMOTE_PATH/scripts/
scp scripts/seed-cms-home.ts $SERVER:$REMOTE_PATH/scripts/

# 2. Execute Aggressive Fix
echo "🏃 Executing fix on server..."
ssh $SERVER "cd $REMOTE_PATH && \
    docker compose -f docker-compose.prod.yml cp prisma/schema.prisma web:/app/prisma/schema.prisma && \
    docker compose -f docker-compose.prod.yml cp scripts/nuclear-fix.ts web:/app/scripts/ && \
    docker compose -f docker-compose.prod.yml exec -T web npx prisma db push --accept-data-loss && \
    docker compose -f docker-compose.prod.yml exec -T web npx prisma generate && \
    docker compose -f docker-compose.prod.yml exec -T web npx tsx scripts/nuclear-fix.ts"

if [ $? -eq 0 ]; then
    echo "------------------------------------------------"
    echo "✅ SUCCESS! All administrative access has been reset."
    echo "Please check the terminal output above for credentials."
    echo "------------------------------------------------"
else
    echo "❌ Execution failed."
    exit 1
fi
