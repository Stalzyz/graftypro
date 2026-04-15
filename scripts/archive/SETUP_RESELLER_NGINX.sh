#!/bin/bash
# SETUP_RESELLER_NGINX.sh
# Helper script to deploy the reseller catch-all Nginx configuration

CONF_FILE="./nginx-reseller.conf"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available/reseller"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled/reseller"

echo "--- Reseller Nginx Setup ---"

if [ ! -f "$CONF_FILE" ]; then
    echo "Error: nginx-reseller.conf not found."
    exit 1
fi

echo "Step 1: Copying configuration to Nginx..."
# Note: On a real VPS, this would require sudo
# cp $CONF_FILE $NGINX_SITES_AVAILABLE

echo "Step 2: Enabling site..."
# ln -s $NGINX_SITES_AVAILABLE $NGINX_SITES_ENABLED

echo "Step 3: Testing Nginx configuration..."
# nginx -t

echo "Step 4: Reloading Nginx..."
# systemctl reload nginx

echo ""
echo "Deployment Instructions for VPS:"
echo "1. Upload 'nginx-reseller.conf' to your VPS."
echo "2. Run: sudo cp nginx-reseller.conf /etc/nginx/sites-available/reseller"
echo "3. Run: sudo ln -s /etc/nginx/sites-available/reseller /etc/nginx/sites-enabled/"
echo "4. Run: sudo nginx -t"
echo "5. Run: sudo systemctl reload nginx"
echo ""
echo "Note: Ensure any existing default or strict server blocks do not conflict with this catch-all."
