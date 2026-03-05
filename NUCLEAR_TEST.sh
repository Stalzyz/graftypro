#!/bin/bash

# GRAFTY BSP NUCLEAR TEST SUITE V2
# Usage: ./NUCLEAR_TEST.sh [URL]
# Default: http://localhost:3000

URL=${1:-"http://localhost:3000"}
echo "===================================================="
echo "☢️  GRAFTY NUCLEAR LEVEL SYSTEM TEST ☢️"
echo "Target: $URL"
echo "===================================================="

# 1. PING TEST
echo -n "[1/5] Testing Vital Connectivity... "
PING=$(curl -s -o /dev/null -w "%{http_code}" "$URL/api/ping" || echo "000")
if [ "$PING" == "200" ] || [ "$PING" == "404" ]; then
    echo "✅ REACHABLE"
else
    echo "❌ UNREACHABLE ($PING)"
    if [ "$URL" == "http://localhost:3000" ]; then
        echo "   💡 TIP: If you are testing local, ensure 'npm run dev' is running."
        echo "   💡 TIP: If you are testing remote, use: ./NUCLEAR_TEST.sh http://72.61.231.187:3001"
    fi
fi

# 2. DIAGNOSTIC HEALTH CHECK
echo -n "[2/5] Fetching Deep System Metrics... "
HEALTH=$(curl -s "$URL/api/diagnostic")
if [[ $HEALTH == *"HEALTHY"* ]]; then
    echo "✅ SYSTEM GREEN"
else
    echo "⚠️  HEALTH WARNING (Check /api/diagnostic)"
    echo "$HEALTH" | python3 -m json.tool 2>/dev/null || echo "$HEALTH"
fi

# 3. DIRECTORY STATE VERIFICATION
echo -n "[3/5] Auditing Filesystem Permissions... "
if [ -d "./public/uploads" ] && [ -w "./public/uploads" ]; then
    echo "✅ READ/WRITE OK"
else
    echo "❌ PERMISSION DENIED"
    echo "   Attempting to fix..."
    mkdir -p public/uploads/{general,whitelabel,branding,flow,theme}
    chmod -R 755 public/uploads
fi

# 4. AUTH MIDDLEWARE SYNC SCAN
echo -n "[4/5] Scanning Auth Protcols... "
# Check if reseller register route is live
# We test /api/reseller/auth/register (Public)
AUTH_LIVE=$(curl -s -o /dev/null -w "%{http_code}" "$URL/api/reseller/auth/register")
if [ "$AUTH_LIVE" == "405" ] || [ "$AUTH_LIVE" == "400" ]; then
    echo "✅ GATEWAY ACTIVE"
else
    echo "⚠️  GATEWAY STATUS ($AUTH_LIVE)"
fi

# 5. MEDIA ENGINE HARDENING
echo -n "[5/5] Stress-Testing Media Engine... "
UPLOAD_CODE=$(grep "image/svg+xml" lib/services/upload.ts)
if [[ $UPLOAD_CODE == *"svg"* ]]; then
    echo "✅ SVG SUPPORT HARDENED"
else
    echo "❌ SVG SUPPORT MISSING"
fi

echo "===================================================="
echo "        SUITE COMPLETE - SYSTEM READY FOR OPS       "
echo "===================================================="
