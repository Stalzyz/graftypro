#!/bin/bash

# 🔑 SSH Key Setup for VPS
# This script will copy your SSH key to the VPS server

SERVER="root@72.61.231.187"

echo "🔑 Setting up SSH key authentication for $SERVER"
echo ""
echo "⚠️  You will be prompted for the VPS password once."
echo "    Password: Photoshop09@"
echo ""
read -p "Press Enter to continue..."

# Copy SSH key to server
ssh-copy-id -i ~/.ssh/id_ed25519 $SERVER

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SSH key successfully copied to server!"
    echo "You can now deploy without entering a password."
    echo ""
    echo "Run: ./DEPLOY_NOW.sh"
else
    echo ""
    echo "❌ Failed to copy SSH key."
    echo "Please check your password and try again."
    exit 1
fi
