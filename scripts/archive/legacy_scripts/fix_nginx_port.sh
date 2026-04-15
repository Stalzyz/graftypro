#!/bin/bash

# 🛠️ Fix Nginx Proxy Port
# Updates grafty.pro config from port 3000 to 3001

SERVER="root@72.61.231.187"

# Enable SSH Pass Automation
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "------------------------------------------------"
echo "🛠️ Fixing Nginx Proxy Port (3000 -> 3001)"
echo "------------------------------------------------"

ssh $SERVER "bash -s" << 'EOF'
    # Backup
    cp /etc/nginx/sites-enabled/grafty.pro /etc/nginx/sites-enabled/grafty.pro.bak
    
    # Replace port 3000 with 3001
    sed -i 's/127.0.0.1:3000/127.0.0.1:3001/g' /etc/nginx/sites-enabled/grafty.pro
    
    # Test and Reload Nginx
    nginx -t && systemctl reload nginx
    
    echo "✅ Nginx configuration updated and reloaded."
EOF
