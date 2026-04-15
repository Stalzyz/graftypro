#!/bin/bash

SERVER="root@72.61.231.187"
CONTAINER_NAME="grafty_bsp-web-1"

if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "Syncing Script to Remote..."
cat scripts/create-dummy-vendor.js | ssh -o StrictHostKeyChecking=no $SERVER "docker exec -i $CONTAINER_NAME sh -c 'cat > scripts/create-dummy-vendor.js'"

if [ $? -ne 0 ]; then
    echo "❌ Failed to sync script!"
    exit 1
fi

echo "Executing Remote Script..."
ssh -o StrictHostKeyChecking=no $SERVER "docker exec $CONTAINER_NAME node scripts/create-dummy-vendor.js"
