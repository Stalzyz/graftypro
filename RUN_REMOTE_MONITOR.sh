
#!/bin/bash
# Monitor Script Wrapper

SERVER="root@72.61.231.187"
CONTAINER_NAME="wabot_bsp-web-1"
CAMPAIGN_ID=$1

if [ -z "$CAMPAIGN_ID" ]; then
    echo "Usage: ./RUN_REMOTE_MONITOR.sh <CAMPAIGN_ID>"
    exit 1
fi

# Enable SSH Pass Automation 
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "🚀 Syncing Monitor Script..."
cat scripts/monitor-campaign.js | ssh -o StrictHostKeyChecking=no $SERVER "docker exec -i $CONTAINER_NAME sh -c 'cat > scripts/monitor-campaign.js'"

echo "📡 Starting Remote Monitor for $CAMPAIGN_ID..."
ssh -o StrictHostKeyChecking=no $SERVER "docker exec $CONTAINER_NAME node scripts/monitor-campaign.js $CAMPAIGN_ID"
