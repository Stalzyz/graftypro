#!/bin/bash
export SSH_ASKPASS="/Users/stalinkumar/Downloads/Grafty_Bsp/scripts/pass.sh"
export SSH_ASKPASS_REQUIRE=force
export DISPLAY=:0

SERVER="root@72.61.231.187"

echo "--- CHECKING HOST UPLOADS ---"
ssh -o StrictHostKeyChecking=no $SERVER "ls -la /root/wabot_bsp/public/uploads/vendor/56180d30-e7bb-4410-92f1-3b721545bd12/general/"
