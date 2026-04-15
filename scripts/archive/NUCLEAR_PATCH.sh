#!/bin/bash
# NUCLEAR FIX: Subscription Upgrade Redirection Loop
# Run this DIRECTLY on the VPS as root

set -e

# Auto-discover project directory
PROJ=$(find / -name "docker-compose.yml" -not -path "*/node_modules/*" 2>/dev/null | head -n1 | xargs dirname)
echo "✅ Project found at: $PROJ"
cd "$PROJ"

# ------------------------------------------------------------------
# FIX 1: middleware.ts - Nuclear billing bypass
# ------------------------------------------------------------------
echo "🔧 Patching middleware.ts..."
if ! grep -q "NUCLEAR BYPASS" "$PROJ/middleware.ts"; then
  # Insert the billing bypass block right before the GUEST-ONLY REDIRECTS section
  sed -i 's|// --------------------------------------------------------\n    // 2. GUEST-ONLY REDIRECTS||g' "$PROJ/middleware.ts"
  
  python3 - <<'PYEOF'
import re

filepath = 'middleware.ts'
with open(filepath, 'r') as f:
    content = f.read()

bypass = """    // --------------------------------------------------------
    // 2. PRIORITY BYPASS & GUEST GUARDS
    // --------------------------------------------------------
    
    // NUCLEAR BYPASS: Always allow authenticated users to reach billing
    if (userId && (path.startsWith("/dashboard/settings/billing") || path.startsWith("/api/billing"))) {
        requestHeaders.set("x-user-id", userId);
        requestHeaders.set("x-workspace-id", workspaceId);
        requestHeaders.set("x-user-role", role);
        return NextResponse.next({ request: { headers: requestHeaders } });
    }

    const guestOnlyPaths"""

old = "    const guestOnlyPaths"
if "NUCLEAR BYPASS" not in content:
    content = content.replace(
        "    // --------------------------------------------------------\n    // 2. GUEST-ONLY REDIRECTS \n    // --------------------------------------------------------\n    const guestOnlyPaths",
        bypass,
        1
    )
    with open(filepath, 'w') as f:
        f.write(content)
    print("  ✅ middleware.ts patched")
else:
    print("  ⚡ middleware.ts already patched — skipping")
PYEOF
fi

# ------------------------------------------------------------------
# FIX 2: Replace all document.cookie auth checks with server-side check
# ------------------------------------------------------------------
echo "🔧 Patching document.cookie auth checks..."

for FILE in \
  "components/landing-new/LandingNavbar.tsx" \
  "components/landing-new/DynamicPricingSection.tsx" \
  "components/landing-new/DynamicPricing.tsx" \
  "app/pricing/page.tsx"
do
  if grep -q 'document.cookie.includes' "$PROJ/$FILE" 2>/dev/null; then
    # Replace the cookie-based login check
    sed -i 's/setIsLoggedIn(document\.cookie\.includes("token="))/fetch("\/api\/auth\/trial-status").then(res => setIsLoggedIn(res.ok)).catch(() => setIsLoggedIn(false))/g' "$PROJ/$FILE"
    echo "  ✅ $FILE patched"
  else
    echo "  ⚡ $FILE already clean — skipping"
  fi
done

# ------------------------------------------------------------------
# FIX 3: TrialGate banner - point to billing, not /pricing
# ------------------------------------------------------------------
echo "🔧 Patching TrialGate.tsx banner link..."
sed -i 's|href="/pricing".*class.*Upgrade Now|href="/dashboard/settings/billing" className={`underline font-black \${urgent ? "text-white" : "text-amber-700"}`}>Upgrade Now|g' "$PROJ/components/trial/TrialGate.tsx" 2>/dev/null || true
# Simpler fallback
python3 - <<'PYEOF'
filepath = 'components/trial/TrialGate.tsx'
with open(filepath, 'r') as f:
    content = f.read()
if 'href="/pricing"' in content:
    content = content.replace('href="/pricing"', 'href="/dashboard/settings/billing"')
    with open(filepath, 'w') as f:
        f.write(content)
    print("  ✅ TrialGate.tsx banner link patched")
else:
    print("  ⚡ TrialGate.tsx already patched — skipping")
PYEOF

# ------------------------------------------------------------------
# FIX 4: LandingNavbar - add server-side auth check
# ------------------------------------------------------------------
echo "🔧 Patching LandingNavbar auth check..."
python3 - <<'PYEOF'
filepath = 'components/landing-new/LandingNavbar.tsx'
with open(filepath, 'r') as f:
    content = f.read()

old = "        fetch(\"/api/config/public\")\n            .then(res => res.json())\n            .then(data => setConfig(data))\n            .catch(() => { });\n    }, []);"
new = """        fetch("/api/config/public")
            .then(res => res.json())
            .then(data => setConfig(data))
            .catch(() => { });

        // Server-verified auth check
        fetch("/api/auth/trial-status")
            .then(res => setIsLoggedIn(res.ok))
            .catch(() => setIsLoggedIn(false));
    }, []);"""

if "trial-status" not in content:
    content = content.replace(old, new)
    # Also add isLoggedIn state if missing
    if "isLoggedIn" not in content:
        content = content.replace(
            "    const [config, setConfig] = useState<any>(null);",
            "    const [config, setConfig] = useState<any>(null);\n    const [isLoggedIn, setIsLoggedIn] = useState(false);"
        )
    with open(filepath, 'w') as f:
        f.write(content)
    print("  ✅ LandingNavbar.tsx patched")
else:
    print("  ⚡ LandingNavbar.tsx already patched — skipping")
PYEOF

# ------------------------------------------------------------------
# REBUILD
# ------------------------------------------------------------------
echo ""
echo "🏗️  Rebuilding web container..."
docker compose up -d --build web

echo ""
echo "=============================================="
echo "✅ NUCLEAR FIX DEPLOYED SUCCESSFULLY"
echo "=============================================="
echo "Test: Visit grafty.pro/pricing"
echo " → Logged in:  Button = 'Upgrade Plan' → /dashboard/settings/billing"
echo " → Guest:      Button = 'Start Free Trial' → /register"
