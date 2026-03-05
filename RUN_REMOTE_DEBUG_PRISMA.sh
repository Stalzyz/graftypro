
#!/bin/bash
# Sync & Debug Prisma

SERVER="root@72.61.231.187"
CONTAINER_NAME="wabot_bsp-worker-1"

# Enable SSH Pass Automation 
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "🚀 Syncing Debug Script..."
cat scripts/debug-prisma.ts | ssh -o StrictHostKeyChecking=no $SERVER "docker exec -i $CONTAINER_NAME sh -c 'cat > scripts/debug-prisma.ts'"

echo "📡 Debugging Prisma Runtime..."
ssh -o StrictHostKeyChecking=no $SERVER "docker exec $CONTAINER_NAME npx tsx scripts/debug-prisma.ts"
