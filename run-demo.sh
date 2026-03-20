#!/bin/bash
# Demo Generator execution script
# Bypasses macOS SIP/Cache lockdowns by running in /tmp

echo "Setting up isolated demo environment in /tmp/wabot-demo..."
mkdir -p /tmp/wabot-demo
cp -r demo-generator /tmp/wabot-demo/

echo "Running Playwright from isolated temporary directory..."
cd /tmp/wabot-demo

# Force Playwright tools/temp files into /tmp to avoid macOS EPERM
export TMPDIR=/tmp
export npm_config_cache=/tmp/pure-cache
export PLAYWRIGHT_BROWSERS_PATH=/tmp/pw-browsers

npx playwright test scenarios/05_master_demo.spec.ts -c demo-generator/playwright.config.ts

echo "Copying recorded videos back to project..."
mkdir -p /Users/stalinkumar/Downloads/Wabot_BSP/demo_videos
cp -r /tmp/wabot-demo/demo_videos/* /Users/stalinkumar/Downloads/Wabot_BSP/demo_videos/ || true

echo "Done! Check demo_videos folder."
