#!/bin/bash
# ══════════════════════════════════════════════════════
#  DEFINITIVE DEPLOY - Pipes files directly via SSH
#  No scp directory issues, no expect needed
# ══════════════════════════════════════════════════════

SERVER="root@72.61.231.187"
REMOTE="/var/www/wabot"

echo ""
echo "═══════════════════════════════════════════"
echo "  GRAFTY DEFINITIVE DEPLOY"
echo "═══════════════════════════════════════════"
echo "  Server: $SERVER"
echo "  Remote: $REMOTE"
echo "═══════════════════════════════════════════"
echo ""

# Shared SSH options
SSHOPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=15"
export SSHPASS="Photoshop09@"

run_remote() {
  echo "Running: $1"
  sshpass -p "$SSHPASS" ssh $SSHOPTS "$SERVER" "$1"
}

upload_file() {
  local LOCAL="$1"
  local REMOTE_PATH="$2"
  echo "📤 Uploading: $LOCAL"
  # Ensure remote directory exists first
  REMOTE_DIR="$(dirname $REMOTE_PATH)"
  run_remote "mkdir -p $REMOTE_DIR"
  # Pipe file content directly via stdin
  sshpass -p "$SSHPASS" ssh $SSHOPTS "$SERVER" "cat > $REMOTE_PATH" < "$LOCAL"
  echo "   ✅ Done: $REMOTE_PATH"
}

# ── Warn if sshpass is missing ──
if ! command -v sshpass &>/dev/null; then
  echo "❌ ERROR: sshpass not found."
  echo ""
  echo "Please run these commands manually on the server instead:"
  echo ""
  echo "1. SSH into the server:"
  echo "   ssh root@$SERVER"
  echo ""
  echo "2. Run these commands on the server:"
  echo "   mkdir -p $REMOTE/app/api/super-admin/billing/sync-razorpay"
  echo "   cd $REMOTE"
  echo ""
  echo "3. Paste the new route.ts content:"
  echo "   cat > app/api/super-admin/billing/sync-razorpay/route.ts << 'HEREDOC_EOF'"
  cat app/api/super-admin/billing/sync-razorpay/route.ts
  echo "HEREDOC_EOF"
  echo ""
  echo "4. Then rebuild:"
  echo "   npm run build && pm2 restart wabot"
  exit 1
fi

# ── Upload files ──
upload_file "app/api/super-admin/billing/sync-razorpay/route.ts" "$REMOTE/app/api/super-admin/billing/sync-razorpay/route.ts"
upload_file "components/landing-new/DynamicPricing.tsx" "$REMOTE/components/landing-new/DynamicPricing.tsx"

# ── Build & Restart ──
echo ""
echo "🔨 Building and restarting..."
run_remote "cd $REMOTE && npm run build && pm2 restart wabot"

echo ""
echo "✅ ALL DONE! Razorpay Resync is now live."
