#!/bin/bash

# Quick fix for Prisma client generation

SERVER="root@72.61.231.187"

if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "🔧 Regenerating Prisma Client on Production..."

ssh -o StrictHostKeyChecking=no $SERVER "bash -s" <<'EOF'
    cd /root/wabot_bsp
    
    echo "📊 Generating Prisma Client..."
    docker compose -f docker-compose.prod.yml exec -T web npx prisma generate
    
    echo "🔄 Restarting Services..."
    docker compose -f docker-compose.prod.yml restart web worker
    
    echo "✅ Prisma Client Fixed!"
EOF

echo "------------------------------------------------"
echo "✨ Fix Applied Successfully!"
echo "------------------------------------------------"
