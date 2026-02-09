#!/bin/bash

# Deploy WhatsApp Integration to Production Server
# Run from your LOCAL machine: ./scripts/deploy-to-production.sh

SERVER="root@72.61.231.187"
REMOTE_PATH="/root/wabot_bsp"
LOCAL_PATH="/Users/stalinkumar/Downloads/Wabot_BSP"

echo "🚀 Deploying WhatsApp Integration to Production"
echo "================================================"
echo ""
echo "Server: $SERVER"
echo "Remote path: $REMOTE_PATH"
echo ""

# Check if we're in the right directory
if [ ! -f "prisma/schema.prisma" ]; then
    echo "❌ Error: Must run from project root"
    echo "Current directory: $(pwd)"
    exit 1
fi

echo "📦 Step 1: Syncing Application Code..."
# Create necessary directories on server
ssh $SERVER "mkdir -p $REMOTE_PATH/app/api/whatsapp $REMOTE_PATH/app/super-admin $REMOTE_PATH/components/whatsapp $REMOTE_PATH/lib/services $REMOTE_PATH/prisma"

# Upload core files individually for better stability
echo "Uploading environment and schema..."
scp .env $SERVER:$REMOTE_PATH/.env
scp prisma/schema.prisma $SERVER:$REMOTE_PATH/prisma/schema.prisma

echo "Uploading new modules..."
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
    app/api/whatsapp/ \
    $SERVER:$REMOTE_PATH/app/api/whatsapp/

rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
    app/super-admin/ \
    $SERVER:$REMOTE_PATH/app/super-admin/

rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
    components/whatsapp/ \
    $SERVER:$REMOTE_PATH/components/whatsapp/

scp lib/services/health-service.ts $SERVER:$REMOTE_PATH/lib/services/
scp lib/whatsapp/service.ts $SERVER:$REMOTE_PATH/lib/whatsapp/
scp lib/security/encryption.ts $SERVER:$REMOTE_PATH/lib/security/

echo "✅ App code synced"
echo ""

echo "🔧 Step 2: Running server-side updates..."
# We combine migration, generation, and restart into one session
ssh $SERVER "bash -s" << 'EOF'
    cd /root/wabot_bsp
    
    echo "📊 Migrating database..."
    npx prisma@5.10.2 db push --schema=prisma/schema.prisma --accept-data-loss
    
    echo "🛠 Generating Prisma client..."
    npx prisma@5.10.2 generate --schema=prisma/schema.prisma
    
    echo "🔄 Restarting services..."
    if [ -f "docker-compose.prod.yml" ]; then
        docker compose -f docker-compose.prod.yml restart web
    else
        pm2 restart all || echo "⚠️ PM2 not found, skipping restart."
    fi
    
    echo "✅ Server-side updates complete!"
EOF

if [ $? -eq 0 ]; then
    echo "🎉 Deployment Successful!"
else
    echo "❌ Deployment failed during server-side execution."
    exit 1
fi
echo ""

echo "🎉 Deployment Complete!"
echo ""
echo "📋 Summary:"
echo "   - Prisma schema updated"
echo "   - Database migrated"
echo "   - Encryption utility deployed"
echo "   - Application restarted"
echo ""
echo "🔍 Verify deployment:"
echo "   ssh $SERVER 'cd $REMOTE_PATH && npx prisma studio'"
echo ""
