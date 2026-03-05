#!/bin/bash
# Diagnostic Script for Webhook Verification
SERVER="root@72.61.231.187"

echo "🔍 Connecting to VPS for Webhook Diagnostic..."
ssh $SERVER "bash -s" << 'EOF'
    echo "--- 1. Checking Environment Variables for Token ---"
    cd /root/grafty_bsp
    # Extract only the VERIFY_TOKEN line, ignore comments
    grep "META_WEBHOOK_VERIFY_TOKEN" .env || echo "❌ META_WEBHOOK_VERIFY_TOKEN not found in .env!"
    
    echo "--- 2. Testing Internal URL Reachability ---"
    # Try localhost:3000 to verify app is listening
    curl -I http://localhost:3000/api/webhooks/whatsapp || echo "❌ App not reachable internally!"
    
    echo "--- 3. Testing Verify Endpoint (Simulating Meta) ---"
    TOKEN=$(grep "META_WEBHOOK_VERIFY_TOKEN" .env | cut -d '=' -f2)
    
    if [ -z "$TOKEN" ]; then
        echo "⚠️ Skipping simulation (Token missing)"
    else
        echo "Simulating GET request with token: $TOKEN"
        # Simulate the GET request Meta sends
        curl -v "http://localhost:3000/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=$TOKEN&hub.challenge=12345"
    fi
    
    echo "--- 4. Checking Nginx Logs for external hits ---"
    tail -n 20 /var/log/nginx/access.log | grep "whatsapp" || echo "No recent WhatsApp hits in Nginx log."
EOF
