#!/bin/bash

# Full rebuild to fix Prisma client issues

SERVER="root@72.61.231.187"

if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQU IRE=force
    export DISPLAY=:0
fi

echo "🔧 Full Rebuild to Fix Prisma Client..."

ssh -o StrictHostKeyChecking=no $SERVER "bash -s" <<'EOF'
    cd /root/wabot_bsp
    
    echo "🛑 Stopping Services..."
    docker compose -f docker-compose.prod.yml down
    
    echo "🏗️ Rebuilding Containers..."
    docker compose -f docker-compose.prod.yml up -d --build
    
    echo "⏳ Waiting 15 seconds for boot..."
    sleep 15
    
    echo "📊 Pushing Schema..."
    docker compose -f docker-compose.prod.yml exec -T web npx prisma db push --accept-data-loss
    
    echo "🔧 Generating Client..."
    docker compose -f docker-compose.prod.yml exec -T web npx prisma generate
    
    echo "🔄 Final Restart..."
    docker compose -fd docker-compose.prod.yml restart web worker
    
    echo "✅ Rebuild Complete!"
EOF

echo "------------------------------------------------"
echo "✨ Production Rebuild Finished!"
echo "------------------------------------------------"
