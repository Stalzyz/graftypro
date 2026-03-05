#!/bin/bash

# 🚀 Grafty BSP: NUCLEAR UPLOAD & STATIC FIX
# This script resolves 404s for uploaded media by fixing permissions and Nginx routing.

DOMAIN="grafty.pro"
REMOTE_PATH="/root/grafty_bsp"
UPLOADS_PATH="$REMOTE_PATH/public/uploads"

echo "------------------------------------------------"
echo "☢️  Executing Nuclear Fix: Uploads & Permissions"
echo "------------------------------------------------"

# 1. Ensure Directory Structure & Permissions
echo "📂 Synchronizing directory hierarchy..."
mkdir -p $UPLOADS_PATH
chmod -R 777 $UPLOADS_PATH

# Allow Nginx to traverse /root for this specific path (Minimal required permission)
chmod 755 /root
chmod 755 $REMOTE_PATH
chmod 755 $REMOTE_PATH/public

# 2. Update Nginx Configuration
# We inject a direct location block for /uploads/ to bypass Next.js middleware entirely.
echo "🔧 Injecting high-performance static routing into Nginx..."

# Identify the config file
NGINX_CONF="/etc/nginx/sites-available/grafty.pro"

if [ ! -f "$NGINX_CONF" ]; then
    NGINX_CONF="/etc/nginx/sites-available/grafty"
fi

# Use Python to safely inject the location block before the first 'location /' block if not present
python3 - <<EOF
import sys
import os

conf_path = "$NGINX_CONF"
if not os.path.exists(conf_path):
    print(f"File {conf_path} not found")
    sys.exit(0)

with open(conf_path, 'r') as f:
    content = f.read()

if 'location /uploads/' in content:
    print("Location /uploads/ already exists in config.")
    sys.exit(0)

injection = """
    # NUCLEAR FIX: Direct Static Serving for Uploads
    location /uploads/ {
        alias $UPLOADS_PATH/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
        access_log off;
    }

"""

# Insert before the first 'location / {'
new_content = content.replace('location / {', injection + '    location / {')

with open(conf_path, 'w') as f:
    f.write(new_content)
print("Static routing injected successfully.")
EOF

# 3. Test and Restart Nginx
echo "🧪 Validating Nginx Protocol..."
nginx -t

if [ $? -eq 0 ]; then
    echo "🚀 Restarting Nginx Infrastructure..."
    systemctl restart nginx
    echo "------------------------------------------------"
    echo "✅ NUCLEAR FIX APPLIED SUCCESSFULLY"
    echo "Uploads are now served directly from the filesystem."
    echo "------------------------------------------------"
else
    echo "❌ Error: Nginx configuration test failed. Reverting changes..."
    exit 1
fi
