#!/bin/bash
# Script to Fix Nginx Upload Limit & Debug Logs
SERVER="root@72.61.231.187"

echo "🔧 Connecting to VPS to Fix Nginx & Check Logs..."
ssh $SERVER "bash -s" << 'EOF'
    # 1. Fix Nginx Upload Limit (Fixes 413 Error)
    echo "🚀 Updating Nginx Client Body Size..."
    echo 'client_max_body_size 50M;' > /etc/nginx/conf.d/upload_limit.conf
    nginx -t && systemctl reload nginx
    echo "✅ Nginx Updated! Image uploads should work now."

    # 2. Check Logs for WhatsApp Webhook Errors (Fixes Missing Messages)
    echo "📋 HEADLINES FROM LOGS (Searching for 'not found' or errors)..."
    cd /root/grafty_bsp
    
    echo "--- WEB LOGS (Last 50 lines) ---"
    docker compose -f docker-compose.prod.yml logs --tail=50 web
    
    echo "--------------------------------"
EOF
