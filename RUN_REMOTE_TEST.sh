
#!/bin/bash
# Reusing Sync Logic

SERVER="root@72.61.231.187"
CONTAINER_NAME="wabot_bsp-worker-1"

# Enable SSH Pass Automation 
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "🚀 Syncing Test Script to Worker..."
cat scripts/test-worker.js | ssh -o StrictHostKeyChecking=no $SERVER "docker exec -i $CONTAINER_NAME sh -c 'cat > scripts/test-worker.js'"

echo "📡 Running Test Job inside Worker..."
# Need to use npx tsx? No, it's JS this time. But bullmq is ts?
# The container has 'bullmq' installed in node_modules?
# Yes, worker uses it.

ssh -o StrictHostKeyChecking=no $SERVER "docker exec $CONTAINER_NAME node scripts/test-worker.js"
