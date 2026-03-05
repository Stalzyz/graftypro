#!/bin/bash

SERVER="root@72.61.231.187"
REMOTE_PATH="/root/wabot_bsp"

# Enable SSH Pass Automation if pass.sh exists
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "------------------------------------------------"
echo "🔐 Resetting Super Admin Credentials..."
echo "------------------------------------------------"

# 1. Upload reset script
echo "📤 Uploading reset script..."
scp scripts/reset-admin-password.ts $SERVER:$REMOTE_PATH/scripts/

if [ $? -ne 0 ]; then
    echo "❌ Upload failed. Please check SSH connection."
    exit 1
fi

# 2. Execute script
echo "🏃 Copying script into container..."
ssh $SERVER "cd $REMOTE_PATH && docker compose -f docker-compose.prod.yml cp scripts/reset-admin-password.ts web:/app/scripts/"

echo "🏃 Executing reset script on server..."
ssh $SERVER "cd $REMOTE_PATH && docker compose -f docker-compose.prod.yml exec -T web npx tsx scripts/reset-admin-password.ts"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Success! Try logging in now."
else
    echo "❌ Execution failed."
    exit 1
fi
