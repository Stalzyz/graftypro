#!/bin/bash

# Configuration
SERVER="root@72.61.231.187"
REMOTE_PATH="/root/wabot_bsp"
BACKUP_ROOT="/root/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_ROOT}/restore_point_${TIMESTAMP}"

echo "🚀 Starting Remote Backup (Restore Point) for Grafty..."

ssh -o StrictHostKeyChecking=no $SERVER << REMOTE_EOF
  echo "📂 Creating backup directory: ${BACKUP_DIR}"
  mkdir -p "${BACKUP_DIR}"

  # 1. Database Backup
  echo "🗄️ Dumping Database..."
  docker exec grafty_postgres pg_dump -U user grafty_bsp > "${BACKUP_DIR}/db_dump.sql"

  # 2. Media Backup (Uploads & Uploads_old)
  echo "🖼️ Archiving Media..."
  tar -czf "${BACKUP_DIR}/media_archives.tar.gz" \
    -C "${REMOTE_PATH}/public" uploads uploads_old 2>/dev/null || echo "⚠️ Some media files could not be read (maybe they don't exist yet)."

  # 3. Code State Backup
  echo "💻 Archiving Code State..."
  tar -czf "${BACKUP_DIR}/project_code.tar.gz" \
    -C "/root" wabot_bsp --exclude=".next" --exclude="node_modules"

  echo "✅ Backup Completed Successfully at ${BACKUP_DIR}"
  echo "📊 Current Backups:"
  ls -lh "${BACKUP_DIR}"
REMOTE_EOF

echo ""
echo "✨ Success! You now have a full restore point on the VPS."
echo "You can find it at: ${BACKUP_DIR}"
echo "Now you can safely run: bash DEPLOY_PHONEPE.sh"
