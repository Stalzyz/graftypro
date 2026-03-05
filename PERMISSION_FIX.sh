#!/bin/bash

# 🛠️ GRAFTY BSP: PERMISSION & ENVIRONMENT REPAIR 🛠️
# Run this if you see EPERM errors in node_modules or .next

echo "------------------------------------------------"
echo "🛠️ REPAIRING PERMISSIONS..."
echo "------------------------------------------------"

# 1. Clear Next.js cache and local builds
echo "🧹 Cleaning artifacts..."
rm -rf .next
rm -rf tmp_cache

# 2. Fix directory ownership (Assumes current user should own everything)
echo "🔒 Resetting ownership..."
sudo chown -R $(whoami) .

# 3. Fix permissions for scripts and public dirs
echo "📂 Setting directory permissions..."
chmod -R 755 public/uploads
chmod +x *.sh

# 4. Clean npm cache if needed
echo "📦 Cleaning npm cache..."
npm cache clean --force

echo "------------------------------------------------"
echo "✅ REPAIR COMPLETE. Please try: npm run dev"
echo "------------------------------------------------"
