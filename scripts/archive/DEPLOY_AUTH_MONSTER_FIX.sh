#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════════
# MONSTER AUTH LOOP FIX — Deploy Script
# Fixes: Google OAuth redirect loop, cookie rejection, middleware crash
# Files changed:
#   1. middleware.ts              — Edge runtime, remove Prisma imports, fix guards
#   2. app/api/auth/google/callback/route.ts — Fix cookie sameSite bug
#   3. app/api/auth/sso-complete/route.ts    — Fix cookie sameSite bug
#   4. app/api/auth/login/route.ts           — Fix cookie sameSite bug
# ═══════════════════════════════════════════════════════════════════════════════

set -e  # Exit on any error

VPS="root@72.61.231.187"
REMOTE_DIR="/root/grafty_bsp"
LOCAL_DIR="/Users/stalinkumar/Downloads/Grafty_Bsp"
SSH_KEY="$HOME/.ssh/id_ed25519"

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║         GRAFTY AUTH LOOP FIX — MONSTER DEPLOY               ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# ── STEP 1: Upload all fixed files ──────────────────────────────────────────
echo "📦 [1/3] Uploading fixed files to VPS..."

scp -i "$SSH_KEY" -o StrictHostKeyChecking=no \
    "$LOCAL_DIR/middleware.ts" \
    "$VPS:$REMOTE_DIR/middleware.ts"
echo "  ✅ middleware.ts"

scp -i "$SSH_KEY" -o StrictHostKeyChecking=no \
    "$LOCAL_DIR/app/api/auth/google/callback/route.ts" \
    "$VPS:$REMOTE_DIR/app/api/auth/google/callback/route.ts"
echo "  ✅ app/api/auth/google/callback/route.ts"

scp -i "$SSH_KEY" -o StrictHostKeyChecking=no \
    "$LOCAL_DIR/app/api/auth/sso-complete/route.ts" \
    "$VPS:$REMOTE_DIR/app/api/auth/sso-complete/route.ts"
echo "  ✅ app/api/auth/sso-complete/route.ts"

scp -i "$SSH_KEY" -o StrictHostKeyChecking=no \
    "$LOCAL_DIR/app/api/auth/login/route.ts" \
    "$VPS:$REMOTE_DIR/app/api/auth/login/route.ts"
echo "  ✅ app/api/auth/login/route.ts"

echo ""
echo "🔨 [2/3] Building & restarting on VPS..."

# ── STEP 2: Remote build + restart ──────────────────────────────────────────
ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$VPS" bash << 'REMOTE_SCRIPT'
set -e
cd /root/grafty_bsp

echo ""
echo "  → Checking environment..."
# Verify critical env vars
if ! grep -q "GOOGLE_CLIENT_ID" .env; then
    echo "  ⚠️  WARNING: GOOGLE_CLIENT_ID not found in .env!"
fi
if ! grep -q "JWT_SECRET" .env; then
    echo "  ⚠️  WARNING: JWT_SECRET not found in .env!"
fi

echo "  → Starting Next.js build (this takes ~2-3 minutes)..."
./node_modules/.bin/next build 2>&1 | tail -20

echo ""
echo "  → Restarting PM2..."
pm2 restart grafty --update-env

echo "  → Waiting 5s for process to stabilize..."
sleep 5

echo "  → PM2 status:"
pm2 list

echo ""
echo "  → Last 20 log lines:"
pm2 logs grafty --lines 20 --nostream
REMOTE_SCRIPT

echo ""
echo "🔍 [3/3] Verifying auth endpoints..."
sleep 3

# Quick health check
echo "  → Checking /api/ping..."
curl -s -o /dev/null -w "  HTTP Status: %{http_code}\n" https://grafty.pro/api/ping || echo "  (ping endpoint not available)"

echo "  → Checking /api/auth/google redirect..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -L --max-redirs 0 https://grafty.pro/api/auth/google 2>/dev/null || echo "000")
if [[ "$HTTP_CODE" == "302" || "$HTTP_CODE" == "301" ]]; then
    echo "  ✅ /api/auth/google is redirecting correctly (HTTP $HTTP_CODE)"
else
    echo "  ⚠️  /api/auth/google returned HTTP $HTTP_CODE (expected 302)"
fi

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                   DEPLOY COMPLETE ✅                         ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 What was fixed:"
echo "  1. middleware.ts — Changed to edge runtime, removed Prisma imports"
echo "     that were causing silent crashes and leaving userId always empty."
echo "  2. All 3 auth routes — Fixed cookie sameSite from 'none' to 'lax'."
echo "     Browsers silently reject sameSite=none without secure=true."
echo "  3. middleware.ts — Fixed guest path check to use startsWith"
echo "     so /login?error=... also matches the guest-only guard."
echo ""
echo "🧪 To verify: Open https://grafty.pro/login and click 'Continue with Google'"
echo "   You should land on /dashboard without any redirect loop."
echo ""
