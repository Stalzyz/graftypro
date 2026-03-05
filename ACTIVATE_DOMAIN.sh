#!/bin/bash
# Domain Activation Script for grafty.pro
# Uses same SSH auth method as DEPLOY_NOW.sh

SERVER="root@72.61.231.187"

export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
export SSH_ASKPASS_REQUIRE=force
export DISPLAY=:0

echo "------------------------------------------------"
echo "🌐 Activating Domain: grafty.pro"
echo "------------------------------------------------"

ssh -o StrictHostKeyChecking=no $SERVER "bash -s" << 'EOF'
    cd /root/wabot_bsp
    echo "📁 Setting up Nginx config for grafty.pro..."

    # Copy the latest nginx config from project
    cp /root/wabot_bsp/nginx-grafty.pro.conf /etc/nginx/sites-available/grafty.pro

    # Enable it (symlink)
    ln -sf /etc/nginx/sites-available/grafty.pro /etc/nginx/sites-enabled/grafty.pro

    # Remove default nginx site if it exists
    rm -f /etc/nginx/sites-enabled/default

    # Check if SSL cert exists
    if [ -d "/etc/letsencrypt/live/grafty.pro" ]; then
        echo "✅ SSL Certificate found."
        nginx -t && systemctl reload nginx
        echo "🎉 Domain LIVE at: https://grafty.pro"
    else
        echo "⚠️  SSL cert not found. Setting up plain HTTP first..."

        # Write a simple HTTP nginx config for the certbot ACME challenge
        cat > /etc/nginx/sites-available/grafty.pro << 'NGINXEOF'
server {
    listen 80;
    server_name grafty.pro www.grafty.pro;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
NGINXEOF

        nginx -t && systemctl reload nginx

        echo "🔐 Requesting SSL certificate from Let's Encrypt..."
        certbot --nginx \
            -d grafty.pro \
            -d www.grafty.pro \
            --non-interactive \
            --agree-tos \
            --email support@grafty.pro \
            --redirect

        CERTBOT_EXIT=$?
        if [ $CERTBOT_EXIT -eq 0 ]; then
            echo "✅ SSL Certificate issued!"
            # Now overwrite with the full production nginx config (with SSL)
            cp /root/wabot_bsp/nginx-grafty.pro.conf /etc/nginx/sites-available/grafty.pro
            nginx -t && systemctl reload nginx
            echo "🎉 Domain LIVE at: https://grafty.pro"
        else
            echo "❌ Certbot failed with exit code: $CERTBOT_EXIT"
            echo "ℹ️  Site is accessible at http://grafty.pro (HTTP only)"
            echo "   Ensure DNS A record for grafty.pro points to 72.61.231.187"
        fi
    fi

    echo ""
    echo "📊 Nginx Status:"
    systemctl status nginx --no-pager | head -10

    echo ""
    echo "🔍 Active Nginx Sites:"
    ls -la /etc/nginx/sites-enabled/

    echo ""
    echo "🌐 Testing connectivity..."
    curl -skI https://grafty.pro 2>&1 | head -5 || curl -sI http://grafty.pro 2>&1 | head -5 || echo "Not yet reachable (DNS may take time)"
EOF

if [ $? -eq 0 ]; then
    echo "------------------------------------------------"
    echo "🎉 SUCCESS: Domain configuration complete!"
    echo "URL: https://grafty.pro"
    echo "------------------------------------------------"
else
    echo "❌ Error: Domain setup failed."
    exit 1
fi
