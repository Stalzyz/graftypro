# ═══════════════════════════════════════════════════════════════════════════════
# MONSTER AUTH LOOP FIX — Manual Deploy Commands
# Run each block in your terminal. Enter your VPS password when prompted.
# ═══════════════════════════════════════════════════════════════════════════════

# ── STEP 1: Upload all 4 fixed files (run from your Mac terminal) ───────────

scp /Users/stalinkumar/Downloads/Grafty_Bsp/middleware.ts \
    root@72.61.231.187:/root/grafty_bsp/middleware.ts

scp /Users/stalinkumar/Downloads/Grafty_Bsp/app/api/auth/google/callback/route.ts \
    root@72.61.231.187:/root/grafty_bsp/app/api/auth/google/callback/route.ts

scp /Users/stalinkumar/Downloads/Grafty_Bsp/app/api/auth/sso-complete/route.ts \
    root@72.61.231.187:/root/grafty_bsp/app/api/auth/sso-complete/route.ts

scp /Users/stalinkumar/Downloads/Grafty_Bsp/app/api/auth/login/route.ts \
    root@72.61.231.187:/root/grafty_bsp/app/api/auth/login/route.ts

# ── STEP 2: SSH into VPS and build ──────────────────────────────────────────
ssh root@72.61.231.187

# Once inside the VPS, run:
cd /root/grafty_bsp && ./node_modules/.bin/next build && pm2 restart grafty

# ── STEP 3: Verify (still inside VPS) ───────────────────────────────────────
pm2 logs grafty --lines 30 --nostream
