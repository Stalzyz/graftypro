
#!/bin/bash
# Reusing Sync Logic for WEB container

SERVER="root@72.61.231.187"
CONTAINER_NAME="grafty_bsp-web-1"

# Enable SSH Pass Automation 
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "🚀 Syncing Test Script to WEB Container..."
cat scripts/test-web-launch.ts | ssh -o StrictHostKeyChecking=no $SERVER "docker exec -i $CONTAINER_NAME sh -c 'cat > scripts/test-web-launch.ts'"

echo "📡 Running Test Job inside WEB Container..."
# Need to use npx tsx? Checks if tsx is available in node_modules
ssh -o StrictHostKeyChecking=no $SERVER "docker exec $CONTAINER_NAME npx tsx scripts/test-web-launch.ts"
