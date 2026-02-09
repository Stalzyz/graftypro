#!/bin/bash

# Wabot BSP - VPS Setup & Deployment Script
# This script installs Docker, Docker Compose, and Nginx on Ubuntu/Debian.

set -e

echo "------------------------------------------------"
echo "🚀 Wabot BSP: VPS Environment Setup"
echo "------------------------------------------------"

# 1. Update System
echo "Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

# 2. Install Docker
if ! [ -x "$(command -v docker)" ]; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker installed."
else
    echo "✅ Docker already installed."
fi

# 3. Install Docker Compose
if ! [ -x "$(command -v docker-compose)" ]; then
    echo "Installing Docker Compose..."
    sudo apt-get install -y docker-compose-plugin
    # Alias docker-compose if needed
    echo "✅ Docker Compose installed."
else
    echo "✅ Docker Compose already installed."
fi

# 4. Install Nginx & Certbot
echo "Installing Nginx and Certbot for SSL..."
sudo apt-get install -y nginx certbot python3-certbot-nginx

# 5. Create Project Directory
mkdir -p ~/wabot_bsp
echo "✅ Directory ~/wabot_bsp created."

echo ""
echo "------------------------------------------------"
echo "🎉 Setup Complete!"
echo "------------------------------------------------"
echo "NEXT STEPS:"
echo "1. Upload your project files to ~/wabot_bsp"
echo "2. Copy .env.example to .env and fill in your production values"
echo "3. Run (inside ~/wabot_bsp):"
echo "   ./deploy.sh"
echo "------------------------------------------------"
