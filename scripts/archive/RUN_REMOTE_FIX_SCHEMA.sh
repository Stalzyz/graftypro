
#!/bin/bash
# Manually Fix Schema in Container

SERVER="root@72.61.231.187"
CONTAINER_NAME="grafty_bsp-worker-1"

# Enable SSH Pass Automation 
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "🚀 Syncing schema.prisma to Worker..."
cat prisma/schema.prisma | ssh -o StrictHostKeyChecking=no $SERVER "docker exec -i $CONTAINER_NAME sh -c 'cat > prisma/schema.prisma'"

echo "🔄 Running Prisma Generate inside Worker..."
ssh -o StrictHostKeyChecking=no $SERVER "docker exec $CONTAINER_NAME npx prisma generate"

echo "🔄 Restarting Worker Container..."
ssh -o StrictHostKeyChecking=no $SERVER "docker restart $CONTAINER_NAME"

echo "✅ Worker Fixed (Hopefully)."
