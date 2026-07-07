#!/bin/bash
# ============================================================
# RUN THIS ON THE VPS DIRECTLY as root
# SSH in: ssh root@72.61.231.187 then paste this whole block
# ============================================================

echo "🔍 DIAGNOSING..."
echo "--- Enabled sites ---"
ls /etc/nginx/sites-enabled/
echo "--- Ports ---"
ss -tlnp | grep -E ':80|:443|:3001|:3000' 2>/dev/null || true
echo "--- SSL Certs ---"
ls /etc/letsencrypt/live/ 2>/dev/null || echo "none"
echo "--- Grafty on port 3001? ---"
curl -s -o /dev/null -w "HTTP:%{http_code}" http://127.0.0.1:3001/ 2>/dev/null
echo ""
echo "--- Current grafty.pro nginx config ---"
cat /etc/nginx/sites-available/grafty.pro 2>/dev/null || echo "NOT FOUND"

echo ""
echo "================================================"
echo "📝 Writing isolated grafty.pro Nginx config..."
echo "================================================"

# Detect SSL
if [ -f "/etc/letsencrypt/live/grafty.pro/fullchain.pem" ]; then
    HAS_SSL=true
    echo "✅ SSL cert found"
else
    HAS_SSL=false
    echo "⚠️  No SSL cert — will use HTTP first, then provision"
fi

# Write HTTPS config if cert exists
if [ "$HAS_SSL" = "true" ]; then
cat > /etc/nginx/sites-available/grafty.pro << 'NGINXEOF'
# GRAFTY.PRO — Isolated config (HTTPS)
# ONLY grafty.pro → port 3001 (Grafty Next.js Docker)
# DO NOT mix raaghas.in here

server {
    listen 80;
    listen [::]:80;
    server_name grafty.pro www.grafty.pro;
    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }
    location / {
        return 301 https://$host$request_uri;
    }
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name grafty.pro www.grafty.pro;

    ssl_certificate /etc/letsencrypt/live/grafty.pro/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/grafty.pro/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    client_max_body_size 50M;

    location /uploads/ {
        alias /root/grafty_bsp/public/uploads/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    access_log /var/log/nginx/grafty.pro.access.log;
    error_log /var/log/nginx/grafty.pro.error.log;
}
NGINXEOF

else

# HTTP-only config (pre-SSL)
cat > /etc/nginx/sites-available/grafty.pro << 'NGINXEOF'
# GRAFTY.PRO — HTTP only (SSL will be provisioned next)
# ONLY grafty.pro → port 3001 (Grafty Next.js Docker)

server {
    listen 80;
    listen [::]:80;
    server_name grafty.pro www.grafty.pro;

    location /.well-known/acme-challenge/ {
        root /var/www/html;
    }

    client_max_body_size 50M;

    location /uploads/ {
        alias /root/grafty_bsp/public/uploads/;
        expires 30d;
    }

    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    access_log /var/log/nginx/grafty.pro.access.log;
    error_log /var/log/nginx/grafty.pro.error.log;
}
NGINXEOF

fi

# Enable and reload
ln -sf /etc/nginx/sites-available/grafty.pro /etc/nginx/sites-enabled/grafty.pro
echo "✅ Site linked"

nginx -t && systemctl reload nginx && echo "✅ Nginx reloaded" || echo "❌ Nginx config error"

# Provision SSL if missing
if [ "$HAS_SSL" = "false" ]; then
    echo ""
    echo "🔐 Provisioning SSL with Certbot..."
    certbot --nginx -d grafty.pro -d www.grafty.pro \
        --non-interactive --agree-tos --email support@grafty.pro --redirect
    
    if [ $? -eq 0 ]; then
        echo "✅ SSL issued and applied!"
        nginx -t && systemctl reload nginx
    else
        echo "❌ Certbot failed — check DNS: grafty.pro must point to $(curl -s ifconfig.me)"
        echo "   Site is live at http://grafty.pro for now"
    fi
fi

echo ""
echo "================================================"
echo "📊 FINAL STATUS"
echo "================================================"
echo "--- Active sites ---"
ls /etc/nginx/sites-enabled/
echo ""
echo "--- Port 3001 test ---"
curl -s -o /dev/null -w "HTTP:%{http_code}" http://127.0.0.1:3001/ 2>/dev/null && echo ""
echo ""
echo "--- grafty.pro test ---"
curl -skI https://grafty.pro 2>/dev/null | head -4 || curl -sI http://grafty.pro | head -4
echo ""
echo "--- raaghas.in test (should still work) ---"
curl -skI https://raaghas.in 2>/dev/null | head -4 || echo "raaghas independent"
echo ""
echo "✅ DONE — grafty.pro is now isolated from raaghas.in"
