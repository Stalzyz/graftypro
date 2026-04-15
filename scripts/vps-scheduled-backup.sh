#!/bin/bash

# Configuration
# Path on VPS where backups will be stored
BACKUP_ROOT="/root/backups/automated"
# Timestamp for filename
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
# Number of days to keep backups
RETENTION_DAYS=7
# Database Container name (as defined in docker-compose.yml)
DB_CONTAINER="grafty_postgres"
# Database User
DB_USER="user"
# Database Name (as defined in .env)
DB_NAME="wabot_bsp"

# 🛑 1. Nuclear Check: Prepare Directory
echo "📂 Ensuring backup directory exists: ${BACKUP_ROOT}"
mkdir -p "${BACKUP_ROOT}"

# 🗄️ 2. Database Backup (Compressed)
# We use gzip to reduce file size significantly
echo "🗄️ Starting Atomic Database Backup..."
docker exec ${DB_CONTAINER} pg_dump -U ${DB_USER} ${DB_NAME} | gzip > "${BACKUP_ROOT}/db_${TIMESTAMP}.sql.gz"

# 🖼️ 3. Media Backup
# Backup your vendors' images and documents
echo "🖼️ Archiving Media Files..."
tar -czf "${BACKUP_ROOT}/media_${TIMESTAMP}.tar.gz" -C "/root/grafty_bsp/public" uploads 2>/dev/null || echo "⚠️ Media folder not found, skipping."

# 🧹 4. Nuclear Cleanup (Retention)
# Automatically deletes anything older than $RETENTION_DAYS
echo "🧹 Purging stale backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_ROOT}" -type f -mtime +${RETENTION_DAYS} -delete

echo "✅ Backup Cycle Complete at ${TIMESTAMP}"
echo "📊 Current automated backups in ${BACKUP_ROOT}:"
ls -lh "${BACKUP_ROOT}"
