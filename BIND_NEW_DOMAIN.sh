#!/bin/bash
# Generic Domain Binding Script for Wabot BSP (v1.1)
# Usage: ./BIND_NEW_DOMAIN.sh yourdomain.com

DOMAIN=$1
SERVER="root@72.61.231.187"
EMAIL="support@grafty.pro" 

if [ -z "$DOMAIN" ]; then
    echo "❌ Error: No domain specified."
    echo "Usage: ./BIND_NEW_DOMAIN.sh yourdomain.com"
    exit 1
fi

export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
export SSH_ASKPASS_REQUIRE=force
export DISPLAY=:0

echo "------------------------------------------------"
echo "🌐 Binding New Domain: $DOMAIN"
echo "------------------------------------------------"

# 1. SSH into server and configure Nginx
ssh -o StrictHostKeyChecking=no $SERVER "bash -s" << EOF
    echo "📁 Creating Nginx config for $DOMAIN..."

    # Write the HTTP-only config first
    cat > /etc/nginx/sites-available/$DOMAIN << 'NGINXEOF'
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINXEOF

    ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
    nginx -t && systemctl reload nginx

    echo "🔐 Requesting SSL Certificate (Root + WWW)..."
    # Try Both
    certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect --expand
    
    if [ \$? -ne 0 ]; then
        echo "⚠️  Failed to secure both Root + WWW (likely DNS for WWW is missing)."
        echo "🔄 Attempting to secure ROOT ONLY ($DOMAIN)..."
        certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email $EMAIL --redirect --reinstall
    fi

    if [ \$? -eq 0 ]; then
        echo "✅ SSL Certificate issued and applied!"
        echo "🎉 Domain LIVE at: https://$DOMAIN"
    else
        echo "❌ SSL provision failed. Site reachable via HTTP only."
        echo "Check DNS A records for $DOMAIN point to 72.61.231.187"
    fi
EOF
