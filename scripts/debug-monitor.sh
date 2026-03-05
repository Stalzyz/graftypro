#!/bin/bash
# Script to Tail Logs for WhatsApp Webhook Debugging
SERVER="root@72.61.231.187"

echo "📡 Monitoring Real-time Logs for WhatsApp Webhook..."
echo "Please send a WhatsApp message to your number NOW."
echo "Press Ctrl+C to stop."

ssh $SERVER "docker compose -f /root/grafty_bsp/docker-compose.prod.yml logs -f --tail=10 web"
