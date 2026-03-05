
#!/bin/bash
# Universal Remote Execution Wrapper

SERVER="root@72.61.231.187"
CMD=$1

if [ -z "$CMD" ]; then
    echo "Usage: ./scripts/remote-exec.sh <COMMAND>"
    exit 1
fi

# Enable SSH Pass Automation 
if [ -f "./scripts/pass.sh" ]; then
    export SSH_ASKPASS="$(pwd)/scripts/pass.sh"
    export SSH_ASKPASS_REQUIRE=force
    export DISPLAY=:0
fi

echo "🚀 Executing Remote Command: $CMD"
ssh -o StrictHostKeyChecking=no $SERVER "$CMD"
