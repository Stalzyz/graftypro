
#!/bin/bash
# Sync Lib & Test Web

SERVER="root@72.61.231.187"
CONTAINER_NAME="wabot_bsp-web-1"

# Enable SSH Pass Automation 
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "🚀 Syncing lib/queue.ts to WEB Container..."
cat lib/queue.ts | ssh -o StrictHostKeyChecking=no $SERVER "docker exec -i $CONTAINER_NAME sh -c 'cat > lib/queue.ts'"

echo "📡 running Test Web..."
./RUN_REMOTE_TEST_WEB.sh
