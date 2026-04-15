#!/bin/bash

SERVER="root@72.61.231.187"
CONTAINER_NAME="grafty_bsp-web-1"

if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "Syncing Monster QA Script to Remote..."
cat scripts/monster-backend-qa.ts | ssh -o StrictHostKeyChecking=no $SERVER "docker exec -i $CONTAINER_NAME sh -c 'cat > scripts/monster-backend-qa.ts'"

if [ $? -ne 0 ]; then
    echo "❌ Failed to sync QA script!"
    exit 1
fi

echo "Executing Monster QA Script..."
ssh -o StrictHostKeyChecking=no $SERVER "docker exec $CONTAINER_NAME npx tsx scripts/monster-backend-qa.ts"
