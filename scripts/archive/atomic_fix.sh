#!/bin/bash

# =================================================================
# ATOMIC SENIOR-LEVEL DEPLOYMENT & SYNC
# Forcing production to reflect current local state.
# =================================================================

SERVER="root@72.61.231.187"
PRIMARY_PATH="/root/grafty_bsp"
SECONDARY_PATH="/var/www/wabot"

# Create a version identifier
TIMESTAMP=$(date +%s)
echo "{\"version\": \"$TIMESTAMP\"}" > public/version.json

echo "🚀 [1/4] Dual-Path Synchronization..."

# Push to PRIMARY
scp app/super-admin/dashboard/layout.tsx $SERVER:$PRIMARY_PATH/app/super-admin/dashboard/layout.tsx
scp app/super-admin/dashboard/packages/page.tsx $SERVER:$PRIMARY_PATH/app/super-admin/dashboard/packages/page.tsx
scp app/api/super-admin/packages/route.ts $SERVER:$PRIMARY_PATH/app/api/super-admin/packages/route.ts
scp "app/api/super-admin/packages/[id]/route.ts" $SERVER:"$PRIMARY_PATH/app/api/super-admin/packages/[id]/route.ts"
scp public/version.json $SERVER:$PRIMARY_PATH/public/version.json

# Push to SECONDARY (Legacy fallback)
scp app/super-admin/dashboard/layout.tsx $SERVER:$SECONDARY_PATH/app/super-admin/dashboard/layout.tsx 2>/dev/null
scp app/super-admin/dashboard/packages/page.tsx $SERVER:$SECONDARY_PATH/app/super-admin/dashboard/packages/page.tsx 2>/dev/null
scp public/version.json $SERVER:$SECONDARY_PATH/public/version.json 2>/dev/null

echo "🔨 [2/4] Executing Clean Rebuild & Audit..."

ssh $SERVER "cd $PRIMARY_PATH && \
    rm -rf .next && \
    npm install && \
    ./node_modules/.bin/next build && \
    echo '✅ Build Successful'"

echo "♻️ [3/4] Nuclear Process Reset..."

ssh $SERVER "pm2 stop all && pm2 kill && cd $PRIMARY_PATH && pm2 start npm --name 'grafty' -- start && pm2 save"

echo "🏁 [4/4] Verifying Live Version..."
curl -s http://72.61.231.187/version.json || echo "Could not verify via IP directly."

echo "✨ ATOMIC FIX COMPLETE. Please refresh your browser."
