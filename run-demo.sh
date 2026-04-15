#!/bin/bash

# GRAFTY AUTO-RECORDING ORCHESTRATOR
# This script runs the Playwright master demo and saves a high-quality video.

echo "🎬 INITIALIZING GRAFTY MASTER RECORDING..."

# 1. Setup Environment
cd demo-generator

# 2. Check for dependencies
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Playwright dependencies..."
    npm install @playwright/test tsx
    npx playwright install chromium
fi

# 3. Execute Master Demo Recording
echo "🎥 STARTING CINEMATIC RECORDING: Phase 1-15..."
echo "📍 Targeting Scenario: scenarios/05_master_demo.spec.ts"

npx playwright test scenarios/05_master_demo.spec.ts

# 4. Finalize
echo "✅ RECORDING COMPLETE!"
echo "📁 Your video is available in: ./demo_videos/"
echo "🔗 Check the latest .webm or .mp4 file in that directory."

cd ..
