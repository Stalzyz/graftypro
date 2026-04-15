#!/bin/bash
# ------------------------------------------------------------------
# Grafty BSP: Manual Forced Deployment Script
# ------------------------------------------------------------------

IP="72.61.231.187"
USER="root"
ZIP_FILE="./grafty_deploy_final.zip"

if [ ! -f "$ZIP_FILE" ]; then
    echo "❌ Error: $ZIP_FILE not found! Please run package_project.sh first."
    exit 1
fi

echo "🚀 Starting Forced Deployment to $IP..."

# 1. Upload
echo "📦 Uploading Project Archive..."
scp "$ZIP_FILE" "$USER@$IP:/root/"

# 2. Deploy
echo "🔧 Executing Remote Commands..."
ssh "$USER@$IP" << EOF
mkdir -p ~/grafty_bsp
mv /root/grafty_deploy_final.zip ~/grafty_bsp/
cd ~/grafty_bsp
unzip -o grafty_deploy_final.zip
chmod +x deploy.sh setup-vps.sh
echo '--- Stopping Services & Cleaning Cache ---'
docker compose -f docker-compose.prod.yml down --remove-orphans
# Force remove any lingering containers using the image to avoid conflicts
docker ps -a -q --filter ancestor=grafty-app:latest | xargs -r docker rm -f
# Force remove the image
docker rmi -f grafty-app:latest || true
docker system prune -f
echo '--- Starting Fresh Deployment ---'
./deploy.sh
echo '--- Restarting Web Server ---'
service nginx restart
EOF

echo ""
echo "------------------------------------------------"
echo "✅ Deployment Process Complete!"
echo "Check: https://grafty.pro/login"
echo "------------------------------------------------"
