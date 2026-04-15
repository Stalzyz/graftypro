#!/bin/bash

# GRAFTY MASTERPIECE ORCHESTRATOR
# Automated Seeding & High-Fidelity Cinematic Recording (2 Hours)

echo "🚀 INITIALIZING THE GRAFTY MASTERPIECE PRODUCTION..."

# 1. Finalize Data Integrity
echo "📦 Step 1: Seeding Master Demo Database (upsert)..."
cd prisma && npx tsx seed-demo-master.ts && cd ..

# 2. Setup Playwright Environment
echo "📦 Step 2: Preparing Recording Pipeline..."
cd demo-generator
if [ ! -d "node_modules" ]; then
    npm install @playwright/test tsx
    npx playwright install chromium
fi

# 3. Execute Recording with 3-Hour Global Buffer
echo "🎥 Step 3: STARTING THE CINEMATIC SESSION (2 Hours Deep-Dive)..."
echo "📍 Scenario: scenarios/05_master_demo.spec.ts"
echo "⏳ This process will take ~2 hours. Monitor the terminal for phase logs."

npx playwright test scenarios/05_master_demo.spec.ts

# 4. Finalize & Locate Assets
echo ""
echo "✅ MASTERPIECE PRODUCTION COMPLETE!"
echo "📁 Your premium video asset is available in: ./demo_videos/"
echo "🔗 Open the latest .webm or .mp4 for the 1080p cinematic output."

cd ..
