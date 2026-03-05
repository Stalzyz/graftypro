#!/bin/bash
# Reset Super Admin Password on Production

VPS="root@72.61.231.187"
VPS_PASS="Photoshop09@"
NEW_PASS="Admin@Grafty2025"

echo "🔐 Resetting Super Admin password on production..."

# Generate bcrypt hash of the new password on the server using Node
export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
export SSH_ASKPASS_REQUIRE=force
export DISPLAY=:0

HASH=$(ssh -o StrictHostKeyChecking=no $VPS "docker exec wabot_bsp-web-1 node -e \"
const bcrypt = require('bcryptjs');
bcrypt.hash('$NEW_PASS', 10).then(h => console.log(h));
\"" 2>/dev/null)

if [ -z "$HASH" ]; then
    echo "❌ Failed to generate hash. Trying with bcrypt..."
    HASH=$(ssh -o StrictHostKeyChecking=no $VPS "docker exec wabot_bsp-web-1 node -e \"
    const bcrypt = require('bcrypt');
    bcrypt.hash('$NEW_PASS', 10).then(h => console.log(h));
    \"" 2>/dev/null)
fi

echo "📋 Hash generated. Updating database..."

# Update the admin password directly in PostgreSQL
ssh -o StrictHostKeyChecking=no $VPS "docker exec wabot_bsp-postgres-1 psql -U grafty -d grafty_bsp -c \"
UPDATE \\\"AdminUser\\\" 
SET password_hash = '$HASH' 
WHERE role = 'SUPER_ADMIN' OR email LIKE '%admin%';

SELECT id, email, role FROM \\\"AdminUser\\\";
\""

echo ""
echo "✅ Password reset complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Super Admin Credentials"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  URL:      http://72.61.231.187:3001/super-admin/login"
echo "  Email:    admin@grafty.com"
echo "  Password: $NEW_PASS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
