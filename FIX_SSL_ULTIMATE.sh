#!/bin/bash
# 🛡️ FIX_SSL_ULTIMATE.sh: Deep SSL Repair for grafty.pro
# This script fixes the directory mismatch and force-provisions SSL.

SERVER="root@72.61.231.187"
DOMAIN="grafty.pro"
REMOTE_PATH="/root/grafty_bsp" # Syncing with DEPLOY_NOW.sh
EMAIL="support@grafty.pro"

# 1. Setup SSH Pass Automation
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "------------------------------------------------"
echo "🔐 Repairing SSL for: $DOMAIN & www.$DOMAIN"
echo "------------------------------------------------"

ssh -o StrictHostKeyChecking=no $SERVER "bash -s" << EOF
    # 1. Fix Directory Symlinks (Ensures consistency)
    if [ ! -d "/root/wabot_bsp" ]; then
        ln -sf $REMOTE_PATH /root/wabot_bsp
        echo "🔗 Created symlink /root/wabot_bsp -> $REMOTE_PATH"
    fi

    # 2. Create the Nginx config for Grafty (Unified)
    echo "📁 Generating Nginx config for $DOMAIN..."
    cat > /etc/nginx/sites-available/$DOMAIN << 'NGINXEOF'
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN api.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}

server {
    listen 443 ssl http2;
    server_name api.$DOMAIN;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINXEOF

    # 3. Enable site
    ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
    rm -f /etc/nginx/sites-enabled/default

    # 4. Preliminary check
    echo "🔍 Checking existing certificates..."
    if [ ! -d "/etc/letsencrypt/live/$DOMAIN" ]; then
        echo "⚠️  No certificate found for $DOMAIN. Attempting provision..."
        
        # Temporary fallback to HTTP-only to allow Certbot to work
        sed -i 's/listen 443 ssl/#listen 443 ssl/g' /etc/nginx/sites-available/$DOMAIN
        sed -i 's/ssl_certificate/#ssl_certificate/g' /etc/nginx/sites-available/$DOMAIN
        nginx -t && systemctl reload nginx

        # Try to get cert for both
        certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect --expand
        
        if [ \$? -ne 0 ]; then
            echo "🔄 Provisioning failed. Attempting ROOT ONLY..."
            certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect
        fi
        
        # Restore SSL lines in config
        sed -i 's/#listen 443 ssl/listen 443 ssl/g' /etc/nginx/sites-available/$DOMAIN
        sed -i 's/#ssl_certificate/ssl_certificate/g' /etc/nginx/sites-available/$DOMAIN
    else
        echo "✅ Certificate exists. Re-applying Nginx configuration..."
    fi

    # 5. Finalize Nginx
    nginx -t && systemctl reload nginx
    echo "🚀 Nginx Reloaded."
EOF

if [ $? -eq 0 ]; then
    echo "------------------------------------------------"
    echo "🎉 SSL Fix Applied! Check: https://$DOMAIN"
    echo "------------------------------------------------"
else
    echo "❌ Failed to apply SSL fix."
    exit 1
fi
