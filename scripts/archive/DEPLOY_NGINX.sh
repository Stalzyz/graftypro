#!/bin/bash
# NGINX WHITELABEL PRESERVATION DEPLOYMENT SCRIPT

SERVER="root@72.61.231.187"

# Enable SSH Pass Automation if present
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0 
fi

echo "==============================================="
echo "🔌 DEPLOYING NGINX PROXY FIX TO VPS"
echo "==============================================="

echo "1. Uploading repaired config to Nginx..."
scp ./nginx-grafty.pro.conf $SERVER:/etc/nginx/sites-available/grafty.pro

echo "2. Running syntax verification..."
ssh $SERVER "nginx -t"

echo "3. Restarting Nginx engine to apply the patch..."
ssh $SERVER "systemctl restart nginx"

echo "==============================================="
echo "✅ NGINX REDIRECT BUG DESTROYED"
echo "You can now safely login from your custom domains!"
echo "If issues persist, please check your Cloudflare settings."
echo "==============================================="
