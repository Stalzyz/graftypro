#!/bin/bash

# =================================================================
# GRAFTY NUCLEAR DEPLOYMENT SCRIPT
# Run this from your MAC terminal in the project folder.
# =================================================================

SERVER="root@72.61.231.187"
REMOTE_PATH="/root/grafty_bsp"

echo "🚀 [1/3] Uploading Nuclear Patch Files..."

# Upload layout
scp app/super-admin/dashboard/layout.tsx $SERVER:$REMOTE_PATH/app/super-admin/dashboard/layout.tsx

# Upload page
scp app/super-admin/dashboard/packages/page.tsx $SERVER:$REMOTE_PATH/app/super-admin/dashboard/packages/page.tsx

# Upload API routes
scp app/api/super-admin/packages/route.ts $SERVER:$REMOTE_PATH/app/api/super-admin/packages/route.ts
scp "app/api/super-admin/packages/[id]/route.ts" $SERVER:"$REMOTE_PATH/app/api/super-admin/packages/[id]/route.ts"

echo "🔨 [2/3] Initiating Server-Side Build (This may take 1-2 minutes)..."

ssh $SERVER "cd $REMOTE_PATH && \
    rm -rf .next && \
    export NODE_OPTIONS='--max-old-space-size=4096' && \
    ./node_modules/.bin/next build && \
    echo '✅ Build Successful'"

echo "♻️ [3/3] Hard-Restarting PM2 Service..."

ssh $SERVER "pm2 restart grafty && pm2 logs grafty --lines 5 --no-colors"

echo "✨ DEPLOYMENT COMPLETE. Please refresh your browser."
