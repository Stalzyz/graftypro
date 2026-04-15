#!/bin/bash

# 🧹 Grafty VPS Maintenance & Space Reclamation Script
# This script safely removes unused Docker layers, build caches, and system logs.

SERVER="root@72.61.231.187"

# Enable SSH Pass Automation if pass.sh exists
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "------------------------------------------------"
echo "🧹 Starting VPS Maintenance: Reclaiming Disk Space"
echo "------------------------------------------------"

ssh -o StrictHostKeyChecking=no $SERVER "bash -s" << 'EOF'
    set -e
    
    echo "🐳 Pruning Docker Build Cache..."
    docker builder prune -f
    
    echo "🖼️ Pruning Unused Docker Images (Dangling)..."
    docker image prune -f
    
    echo "📦 Pruning All Unused Docker Objects (Safe)..."
    docker system prune -f
    
    echo "📜 Vacuuming System Logs (Keeping last 24h)..."
    journalctl --vacuum-time=1d
    
    echo "🧹 Cleaning Package Cache..."
    apt-get clean
    apt-get autoremove -y
    
    echo "🗑️ Clearing Temporary Files..."
    rm -rf /tmp/*
    
    echo "📊 Current Disk Usage:"
    df -h | grep '^/dev/'
    
    echo "✅ Maintenance Complete!"
EOF

echo "------------------------------------------------"
echo "🎉 VPS Space Reclamation Finished!"
echo "------------------------------------------------"
