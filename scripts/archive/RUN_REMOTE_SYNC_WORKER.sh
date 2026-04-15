
#!/bin/bash
# Sync Worker Code & Restart

SERVER="root@72.61.231.187"
CONTAINER_NAME="grafty_bsp-worker-1"

# Enable SSH Pass
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "🚀 Syncing worker.ts..."
cat worker.ts | ssh -o StrictHostKeyChecking=no $SERVER "docker exec -i $CONTAINER_NAME sh -c 'cat > worker.ts'"

echo "🚀 Syncing WhatsApp Service..."
cat lib/whatsapp/service.ts | ssh -o StrictHostKeyChecking=no $SERVER "docker exec -i $CONTAINER_NAME sh -c 'mkdir -p lib/whatsapp && cat > lib/whatsapp/service.ts'"

echo "🔄 Restarting Worker Container..."
ssh -o StrictHostKeyChecking=no $SERVER "docker restart $CONTAINER_NAME"

echo "✅ Worker Restarter Initiated. Logs should appear soon."
