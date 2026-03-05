#!/bin/bash
export SSH_ASKPASS="/Users/stalinkumar/Downloads/Wabot_BSP/scripts/pass.sh"
export SSH_ASKPASS_REQUIRE=force
export DISPLAY=:0

SERVER="root@72.61.231.187"

echo "--- SEARCHING ERRORS IN WEB LOGS ---"
ssh -o StrictHostKeyChecking=no $SERVER "docker logs wabot_bsp-web-1 2>&1 | grep -i 'error' | tail -n 20"
