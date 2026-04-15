#!/bin/bash
echo "Attemping to fix node environment..."

# 1. Clear npm cache forcefully (might need sudo)
echo "Cleaning npm cache..."
npm cache clean --force

# 2. Fix ownership of .npm folder (requires sudo password from user)
echo "Fixing .npm permissions (might ask for password)..."
sudo chown -R $USER ~/.npm

# 3. Reinstall dependencies
echo "Reinstalling dependencies..."
rm -rf node_modules package-lock.json
npm install

# 4. Start dev server
echo "Starting server..."
npm run dev
