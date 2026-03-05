
#!/bin/bash
# Fixed Remote Execution Wrapper with Auth & Sync

SERVER="root@72.61.231.187"
CONTAINER_NAME="wabot_bsp-web-1"

# Enable SSH Pass Automation 
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    # Fake display often trick ssh-askpass
    export DISPLAY=:0
fi

echo "🚀 Syncing Seed Script to Remote Container..."
# Using cat to pipe local file to remote container
# Needs to run in a separate SSH call or part of the same logic
# We use the same SSH_ASKPASS context

cat scripts/seed-vendor-ops.js | ssh -o StrictHostKeyChecking=no $SERVER "docker exec -i $CONTAINER_NAME sh -c 'cat > scripts/seed-vendor-ops.js'"

if [ $? -ne 0 ]; then
    echo "❌ Failed to sync script!"
    exit 1
fi

echo "🚀 Executing Remote Seed..."

ssh -o StrictHostKeyChecking=no $SERVER "docker exec $CONTAINER_NAME node scripts/seed-vendor-ops.js"

if [ $? -eq 0 ]; then
    echo "✅ Remote Seed Execution SUCCESS!"
else
    echo "❌ Remote Seed Execution FAILED!"
    exit 1
fi
