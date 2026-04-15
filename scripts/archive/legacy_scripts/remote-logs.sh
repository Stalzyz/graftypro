
#!/bin/bash
# Check Remote Logs Wrapper

SERVER="root@72.61.231.187"
CONTAINER_NAME=$1

if [ -z "$CONTAINER_NAME" ]; then
    echo "Usage: ./scripts/remote-logs.sh <CONTAINER_NAME>"
    exit 1
fi

# Enable SSH Pass Automation 
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "📋 Fetching logs for $CONTAINER_NAME..."
ssh -o StrictHostKeyChecking=no $SERVER "docker logs $CONTAINER_NAME --tail 200"
