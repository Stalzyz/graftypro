#!/bin/bash
# ============================================================
# CATALOG FIX DEPLOY SCRIPT
# Uploads fixed flow-executor.ts to VPS and rebuilds web container
# Run from Mac: bash deploy-catalog-fix.sh
# ============================================================

VPS="root@srv1328775"
REMOTE_DIR="/root/wabot_bsp"
LOCAL_DIR="/Users/stalinkumar/Downloads/Wabot_BSP"

echo ""
echo "🚀 Uploading fixed files to VPS..."

# Upload critical fixed files
scp "$LOCAL_DIR/lib/engine/flow-executor.ts" "$VPS:$REMOTE_DIR/lib/engine/flow-executor.ts"
echo "✅ flow-executor.ts uploaded"

scp "$LOCAL_DIR/components/flow-builder/FlowPropertiesPanel.tsx" "$VPS:$REMOTE_DIR/components/flow-builder/FlowPropertiesPanel.tsx"
echo "✅ FlowPropertiesPanel.tsx uploaded"

echo ""
echo "🔨 Rebuilding Docker image on VPS (this takes 5-10 minutes)..."
echo "   Watch progress below:"
echo ""

# SSH into VPS and rebuild + restart
ssh "$VPS" << 'ENDSSH'
  set -e
  cd /root/wabot_bsp

  echo "📦 Building new grafty-app:latest image..."
  docker build -t grafty-app:latest . 2>&1 | tail -20

  echo ""
  echo "🔄 Stopping old web container..."
  docker stop wabot_bsp-web-1 2>/dev/null && docker rm wabot_bsp-web-1 2>/dev/null || true

  echo "🚀 Starting new web container..."
  docker-compose -f docker-compose.prod.yml up -d web

  echo ""
  echo "⏳ Waiting 5s for container to come up..."
  sleep 5

  echo "📋 Running containers:"
  docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

  echo ""
  echo "✅ DONE! Catalog fix deployed."
  echo "   The web container is now running the latest code with the MONSTER_CATALOG fix."
  echo "   Test by sending 'pay' on WhatsApp."
ENDSSH

echo ""
echo "🎉 Deploy complete!"
