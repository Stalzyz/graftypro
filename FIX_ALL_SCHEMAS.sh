
#!/bin/bash
# Manually Fix Schema in ALL Containers

SERVER="root@72.61.231.187"
CONTAINERS=("wabot_bsp-web-1" "wabot_bsp-worker-1")

# Enable SSH Pass Automation 
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

for CONTAINER in "${CONTAINERS[@]}"; do
    echo "🚀 Fixing $CONTAINER..."
    
    echo "  - Syncing schema.prisma..."
    cat prisma/schema.prisma | ssh -o StrictHostKeyChecking=no $SERVER "docker exec -i $CONTAINER sh -c 'cat > prisma/schema.prisma'"

    echo "  - Running Prisma Generate..."
    ssh -o StrictHostKeyChecking=no $SERVER "docker exec $CONTAINER npx prisma generate"

    echo "  - Restarting Container..."
    ssh -o StrictHostKeyChecking=no $SERVER "docker restart $CONTAINER"
    
    echo "✅ $CONTAINER Fixed."
done

echo "🎉 All containers patched with local schema."
