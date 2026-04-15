#!/bin/bash

# FINAL ROBUST FIX for Prisma Schema with VERIFICATION v2
# This copies the schema DIRECTLY into the container and regenerates

SERVER="root@72.61.231.187"
REMOTE_PATH="/root/wabot_bsp"

# Enable SSH Pass Automation if pass.sh exists
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "🔧 EXECUTING FINAL FIX v2..."
echo "------------------------------------------------"

# 1. Upload fresh schema to Host
echo "📤 Uploading fresh Prisma schema to Host..."
rsync -avz -e "ssh -o StrictHostKeyChecking=no" \
    ./prisma/ $SERVER:$REMOTE_PATH/prisma/

# 2. Execute remote operations
ssh -o StrictHostKeyChecking=no $SERVER "bash -s" <<'EOF'
    cd /root/wabot_bsp
    
    # Get container ID for the web service
    CONTAINER=$(docker compose -f docker-compose.prod.yml ps -q web)
    
    if [ -z "$CONTAINER" ]; then
        echo "❌ Error: Web container not found!"
        exit 1
    fi
    
    echo "🎯 Found Container: $CONTAINER"

    echo "🔍 CHECK 1: Verifying Host Schema..."
    if grep -q "model CRMLead" ./prisma/schema.prisma; then
        echo "✅ Host file VALID (Has CRMLead)"
    else
        echo "❌ Host file INVALID (Missing CRMLead)"
        exit 1
    fi
    
    # Force copy schema from Host into Container
    echo "📦 Copying schema into container..."
    docker cp ./prisma/schema.prisma $CONTAINER:/app/prisma/schema.prisma

    echo "🔍 CHECK 2: Verifying Container Schema..."
    if docker exec $CONTAINER grep -q "model CRMLead" /app/prisma/schema.prisma; then
        echo "✅ Container file VALID (Has CRMLead)"
    else
        echo "❌ Container file INVALID"
        exit 1
    fi
    
    # Regenerate inside container
    echo "📊 Regenerating Prisma Client inside container..."
    docker exec $CONTAINER npx prisma generate --schema /app/prisma/schema.prisma
    
    # Restart to load new client
    echo "🔄 Restarting web service..."
    docker compose -f docker-compose.prod.yml restart web
    
    echo "⏳ Waiting 15 seconds for boot..."
    sleep 15
    
    echo "✅ FIX COMPLETE!"
EOF
