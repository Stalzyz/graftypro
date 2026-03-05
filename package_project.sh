#!/bin/bash
# ------------------------------------------------------------------
# NUCLEAR Package Script for Deployment
# ------------------------------------------------------------------

ZIP_NAME="grafty_deploy_final.zip"

echo "🧹 cleaning up old zip files..."
rm -f "$ZIP_NAME"

echo "📦 Packaging Grafty BSP (Source Code ONLY)..."

# Using zip with -x to exclude everything not needed.
zip -r "$ZIP_NAME" . \
    -x "node_modules/*" \
    -x ".next/*" \
    -x ".git/*" \
    -x "*.zip" \
    -x "*.tar.gz" \
    -x "brain/*" \
    -x ".npm-cache/*" \
    -x "tmp/*" \
    -x "Capture/*" \
    -x ".DS_Store" \
    -x "public/uploads/*" \
    -x "worker.ts" \
    -x "workers/*" \
    -x "test/*"

echo ""
echo "------------------------------------------------"
echo "✅ Package Created: $ZIP_NAME"
ls -lh "$ZIP_NAME"
echo "------------------------------------------------"
