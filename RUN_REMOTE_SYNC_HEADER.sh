#!/bin/bash
# Sync Header Component to WEB Container

SERVER="root@72.61.231.187"
CONTAINER_NAME="wabot_bsp-web-1"

if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "🚀 Syncing SmartPartnerLink to Web Container..."
cat components/landing-new/SmartPartnerLink.tsx | ssh -o StrictHostKeyChecking=no $SERVER "docker exec -i $CONTAINER_NAME sh -c 'cat > components/landing-new/SmartPartnerLink.tsx'"

# Run Next build if we modifying UI or just let Next dev server catch it? 
# Usually components are hot reloaded if node is in dev mode, but if it is production we might need a rebuild.
# Considering a docker restart might be safer. Let's restart.
echo "🔄 Restarting Web Container..."
ssh -o StrictHostKeyChecking=no $SERVER "docker restart $CONTAINER_NAME"

echo "✅ Web Updated."
