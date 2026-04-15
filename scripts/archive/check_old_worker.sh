#!/bin/bash
export SSH_ASKPASS="/Users/stalinkumar/Downloads/Grafty_Bsp/scripts/pass.sh"
export SSH_ASKPASS_REQUIRE=force
export DISPLAY=:0

SERVER="root@72.61.231.187"

echo "--- OLD WORKER LOGS ---"
ssh -o StrictHostKeyChecking=no $SERVER "docker logs --tail 20 grafty_bsp-worker-1"
