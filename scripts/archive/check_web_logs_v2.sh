#!/bin/bash
export SSH_ASKPASS="/Users/stalinkumar/Downloads/Grafty_Bsp/scripts/pass.sh"
export SSH_ASKPASS_REQUIRE=force
export DISPLAY=:0

SERVER="root@72.61.231.187"

echo "--- CHECKING WEB LOGS FOR ERRORS ---"
ssh -o StrictHostKeyChecking=no $SERVER "docker logs --tail 200 grafty_bsp-web-1"
