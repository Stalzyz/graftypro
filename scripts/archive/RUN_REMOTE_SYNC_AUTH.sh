
#!/bin/bash
# Sync Auth Route to WEB Container

SERVER="root@72.61.231.187"
CONTAINER_NAME="grafty_bsp-web-1"

# Enable SSH Pass Automation 
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "🚀 Syncing Google Callback Route..."
# Use mkdir -p to ensure path exists
cat app/api/auth/google/callback/route.ts | ssh -o StrictHostKeyChecking=no $SERVER "docker exec -i $CONTAINER_NAME sh -c 'mkdir -p app/api/auth/google/callback && cat > app/api/auth/google/callback/route.ts'"

echo "🔄 Restarting Web Container..."
ssh -o StrictHostKeyChecking=no $SERVER "docker restart $CONTAINER_NAME"

echo "✅ Web Auth Fixed."
