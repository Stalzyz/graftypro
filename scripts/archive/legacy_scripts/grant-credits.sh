#!/bin/bash
SERVER="root@72.61.231.187"

echo "💰 Granting 1000.00 Credits to ALL Workspaces on Production..."

ssh $SERVER "bash -s" << 'EOF'
    cd /root/grafty_bsp
    
    # Execute SQL directly into the DB container
    # We try an INSERT ON CONFLICT (Upsert) logic.
    # Note: 'vendor_wallets' is the table name (mapped in schema as @@map("vendor_wallets"))
    # We populate 'id' with gen_random_uuid()
    
    docker compose -f docker-compose.prod.yml exec -T postgres psql -U user -d grafty_bsp -c "
      INSERT INTO vendor_wallets (id, workspace_id, current_balance, updated_at, total_purchased, total_used, is_frozen, is_automated_blocked)
      SELECT 
        gen_random_uuid(), 
        id, 
        1000.00, 
        NOW(),
        0,
        0,
        false,
        false
      FROM workspaces
      ON CONFLICT (workspace_id) 
      DO UPDATE SET current_balance = vendor_wallets.current_balance + 1000.00;
    "
    
    echo "✅ Credits Granted!"
EOF
