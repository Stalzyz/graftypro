
#!/bin/bash
# Sync & Run Grant Credits in Worker

SERVER="root@72.61.231.187"
CONTAINER_NAME="grafty_bsp-worker-1"

# Enable SSH Pass Automation 
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "🚀 Syncing Grant Script to Worker..."
cat scripts/grant-credits.js | ssh -o StrictHostKeyChecking=no $SERVER "docker exec -i $CONTAINER_NAME sh -c 'cat > scripts/grant-credits.js'"

echo "📡 Granting Credits..."
ssh -o StrictHostKeyChecking=no $SERVER "docker exec $CONTAINER_NAME node scripts/grant-credits.js"
