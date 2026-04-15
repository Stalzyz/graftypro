
#!/bin/bash
# Sync & Run Reset

SERVER="root@72.61.231.187"
CONTAINER_NAME="grafty_bsp-web-1"

# Enable SSH Pass Automation 
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "🚀 Syncing Reset Script..."
cat scripts/reset-campaign.js | ssh -o StrictHostKeyChecking=no $SERVER "docker exec -i $CONTAINER_NAME sh -c 'cat > scripts/reset-campaign.js'"

echo "📡 Resetting Campaign Status..."
ssh -o StrictHostKeyChecking=no $SERVER "docker exec $CONTAINER_NAME node scripts/reset-campaign.js"
