
#!/bin/bash
# Sync & Run Debug Env

SERVER="root@72.61.231.187"
CONTAINER_NAME="grafty_bsp-web-1"

# Enable SSH Pass Automation 
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "🚀 Syncing debug-env.ts..."
cat scripts/debug-env.ts | ssh -o StrictHostKeyChecking=no $SERVER "docker exec -i $CONTAINER_NAME sh -c 'cat > scripts/debug-env.ts'"

echo "📡 Running Debug Env..."
ssh -o StrictHostKeyChecking=no $SERVER "docker exec $CONTAINER_NAME npx tsx scripts/debug-env.ts"
