#!/bin/bash

# =================================================================
# GRAFTY CREDIT CONSUMPTION ENGINE DEPLOYMENT SCRIPT
# =================================================================

SERVER="root@72.61.231.187"
REMOTE_PATH="/root/grafty_bsp"

echo "🚀 [1/3] Uploading WhatsApp Service and API Routes..."

# Upload Library
scp lib/whatsapp/service.ts $SERVER:$REMOTE_PATH/lib/whatsapp/service.ts

# Upload API Routes
scp app/api/chats/send/route.ts $SERVER:$REMOTE_PATH/app/api/chats/send/route.ts
scp 'app/api/conversations/[id]/messages/route.ts' "$SERVER:$REMOTE_PATH/app/api/conversations/[id]/messages/route.ts"
scp app/api/cron/process-drips/route.ts $SERVER:$REMOTE_PATH/app/api/cron/process-drips/route.ts
scp app/api/webhooks/whatsapp/route.ts $SERVER:$REMOTE_PATH/app/api/webhooks/whatsapp/route.ts
scp app/api/v1/trigger/route.ts $SERVER:$REMOTE_PATH/app/api/v1/trigger/route.ts
scp app/api/commerce/recovery/send/route.ts $SERVER:$REMOTE_PATH/app/api/commerce/recovery/send/route.ts
scp 'app/api/education/forms/submit/[id]/route.ts' "$SERVER:$REMOTE_PATH/app/api/education/forms/submit/[id]/route.ts"

echo "🔨 [2/3] Initiating Server-Side Build..."

ssh $SERVER "cd $REMOTE_PATH && \
    rm -rf .next && \
    export NODE_OPTIONS='--max-old-space-size=4096' && \
    ./node_modules/.bin/next build && \
    echo '✅ Build Successful'"

echo "♻️ [3/3] Hard-Restarting PM2 Service..."

ssh $SERVER "pm2 restart grafty && pm2 logs grafty --lines 5 --no-colors"

echo "✨ BILLING ENGINE DEPLOYMENT COMPLETE."
