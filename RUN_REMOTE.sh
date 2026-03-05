#!/bin/bash
# Helper to run remote commands using the local pass.sh

CMD=$1
SERVER="root@72.61.231.187"

if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

ssh -o StrictHostKeyChecking=no $SERVER "$CMD"
