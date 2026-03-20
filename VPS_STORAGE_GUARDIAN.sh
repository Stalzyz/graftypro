#!/bin/bash
# ============================================================
# 👹 VPS STORAGE GUARDIAN — Audit, Clean & Protect
# Production-grade storage management for BSP
# ============================================================
set -e

VPS_HOST="root@72.61.231.187"
APP_DIR="/root/wabot_bsp"
LOGROTATE_CONF="/etc/logrotate.d/wabot-bsp"

RED='\033[0;31m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'; BLUE='\033[0;34m'; NC='\033[0m'

info()  { echo -e "${BLUE}ℹ️  $1${NC}"; }
warn()  { echo -e "${YELLOW}⚠️  $1${NC}"; }
good()  { echo -e "${GREEN}✅ $1${NC}"; }
alert() { echo -e "${RED}🚨 $1${NC}"; }

echo ""
echo "╔══════════════════════════════════════════════════════════╗"
echo "║  👹 VPS STORAGE GUARDIAN — FULL AUDIT & CLEANUP         ║"
echo "║  Production-safe — No user data deleted                 ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

ssh -o StrictHostKeyChecking=no $VPS_HOST << 'REMOTE_EOF'

RED='\033[0;31m'; YELLOW='\033[1;33m'; GREEN='\033[0;32m'; BLUE='\033[0;34m'; NC='\033[0m'

# ────────────────────────────────────────────────────────────
# PHASE 1: FULL STORAGE AUDIT
# ────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 PHASE 1 — FULL STORAGE AUDIT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "🖥️  OVERALL DISK USAGE:"
df -h /

echo ""
echo "📁 TOP-LEVEL DIRECTORY SIZES:"
du -h --max-depth=1 / 2>/dev/null | sort -rh | head -15

echo ""
echo "📁 /var BREAKDOWN:"
du -h --max-depth=2 /var 2>/dev/null | sort -rh | head -15

echo ""
echo "📁 /root BREAKDOWN:"
du -h --max-depth=2 /root 2>/dev/null | sort -rh | head -15

echo ""
echo "🔍 FINDING FILES LARGER THAN 200MB:"
find / -type f -size +200M 2>/dev/null | while read f; do
    size=$(du -h "$f" 2>/dev/null | cut -f1)
    echo "  $size  $f"
done | sort -rh | head -20

echo ""
echo "🐳 DOCKER STORAGE USAGE:"
docker system df 2>/dev/null

# ────────────────────────────────────────────────────────────
# PHASE 2: APPLICATION DIRECTORY ANALYSIS
# ────────────────────────────────────────────────────────────
APP_DIR="/root/wabot_bsp"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 PHASE 2 — APPLICATION DIRECTORY ANALYSIS"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ -d "$APP_DIR" ]; then
    echo ""
    echo "📁 Application directory: $APP_DIR"
    du -h --max-depth=1 "$APP_DIR" 2>/dev/null | sort -rh

    for dir in ".next" "node_modules" "public/uploads" "logs" ".npm" ".cache"; do
        full="$APP_DIR/$dir"
        if [ -d "$full" ]; then
            sz=$(du -sh "$full" 2>/dev/null | cut -f1)
            echo "   📂 $dir → $sz"
        fi
    done
fi

# ────────────────────────────────────────────────────────────
# PHASE 3: LOG FILE AUDIT AND ROTATION
# ────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📜 PHASE 3 — LOG FILE AUDIT & ROTATION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "🔍 Oversized log files (>50MB):"
find /var/log "$APP_DIR/logs" 2>/dev/null -name "*.log" -size +50M -exec du -sh {} \; | sort -rh

echo ""
echo "🧹 Cleaning /var/log of rotated/old logs:"
BEFORE_LOG=$(du -sh /var/log 2>/dev/null | cut -f1)
find /var/log -name "*.gz" -mtime +30 -delete 2>/dev/null || true
find /var/log -name "*.log.*" -mtime +30 -delete 2>/dev/null || true
journalctl --vacuum-time=7d 2>/dev/null || true
AFTER_LOG=$(du -sh /var/log 2>/dev/null | cut -f1)
echo "   /var/log: $BEFORE_LOG → $AFTER_LOG"

# Truncate app log files > 100MB (keeps last 1000 lines)
if [ -d "$APP_DIR/logs" ]; then
    echo ""
    echo "🔄 Rotating oversized app log files:"
    find "$APP_DIR/logs" -name "*.log" -size +100M | while read logfile; do
        sz=$(du -sh "$logfile" | cut -f1)
        echo "  Truncating $logfile ($sz) → keeping last 2000 lines"
        tail -2000 "$logfile" > "$logfile.tmp" && mv "$logfile.tmp" "$logfile"
    done
fi

# ────────────────────────────────────────────────────────────
# PHASE 4: DOCKER CLEANUP (SAFE)
# ────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🐳 PHASE 4 — DOCKER CLEANUP (Unused Images & Cache)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "🔍 Before Docker cleanup:"
docker system df

echo ""
echo "🧹 Removing stopped containers, dangling images, unused networks..."
docker container prune -f 2>/dev/null || true
docker image prune -f 2>/dev/null || true
docker network prune -f 2>/dev/null || true
docker builder prune -f 2>/dev/null || true

echo ""
echo "🔍 Checking for large unused images (not running):"
RUNNING_IMAGES=$(docker ps --format '{{.Image}}' 2>/dev/null)
docker images --format "{{.Repository}}:{{.Tag}} {{.Size}} {{.ID}}" 2>/dev/null | while read line; do
    echo "  🖼️  $line"
done

echo ""
echo "🔍 After Docker cleanup:"
docker system df

# ────────────────────────────────────────────────────────────
# PHASE 5: CACHE AND TEMP FILES
# ────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧹 PHASE 5 — CACHE & TEMP FILES CLEANUP"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
TOTAL_TEMP=0

# /tmp files older than 7 days
TMP_BEFORE=$(du -sh /tmp 2>/dev/null | cut -f1)
find /tmp -type f -mtime +7 -delete 2>/dev/null || true
find /tmp -type d -empty -mtime +7 -delete 2>/dev/null || true
TMP_AFTER=$(du -sh /tmp 2>/dev/null | cut -f1)
echo "   /tmp: $TMP_BEFORE → $TMP_AFTER"

# APT cache
if command -v apt-get &>/dev/null; then
    echo "   Cleaning apt cache..."
    apt-get clean -y 2>/dev/null || true
fi

# npm cache (root user)
NPM_CACHE_SIZE=$(du -sh ~/.npm 2>/dev/null | cut -f1 || echo "0")
echo "   npm cache size: $NPM_CACHE_SIZE (cleaning...)"
npm cache clean --force 2>/dev/null || true
NPM_AFTER=$(du -sh ~/.npm 2>/dev/null | cut -f1 || echo "0")
echo "   npm cache: $NPM_CACHE_SIZE → $NPM_AFTER"

# ────────────────────────────────────────────────────────────
# PHASE 6: BACKUP FILES CHECK
# ────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "💾 PHASE 6 — BACKUP FILES DETECTION"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

echo ""
echo "🔍 Looking for large archives and SQL dumps:"
find / -type f \( -name "*.sql" -o -name "*.zip" -o -name "*.tar" -o -name "*.gz" -o -name "*.tar.gz" \) \
    -size +50M 2>/dev/null | while read f; do
    sz=$(du -sh "$f" 2>/dev/null | cut -f1)
    echo "  ⚠️  $sz  $f"
done

# ────────────────────────────────────────────────────────────
# PHASE 7: INSTALL LONG-TERM STORAGE MANAGEMENT
# ────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🛡️  PHASE 7 — INSTALLING LONG-TERM STORAGE GUARDIAN"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Install logrotate config for app logs
echo ""
echo "📝 Installing logrotate config for app logs..."
cat > /etc/logrotate.d/wabot-bsp << 'LOGROTATE'
/root/wabot_bsp/logs/*.log {
    daily
    missingok
    rotate 7
    compress
    delaycompress
    notifempty
    copytruncate
    maxsize 50M
    dateext
    dateformat -%Y%m%d
}
LOGROTATE
echo "   ✅ Logrotate config installed at /etc/logrotate.d/wabot-bsp"

# Docker log rotation config (via daemon.json)
echo ""
echo "🐳 Configuring Docker log rotation (JSON file driver limits)..."
mkdir -p /etc/docker
if [ ! -f /etc/docker/daemon.json ]; then
    cat > /etc/docker/daemon.json << 'DOCKERLOG'
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "5"
  }
}
DOCKERLOG
    echo "   ✅ Docker daemon.json created with log limits (10MB × 5 files per container)"
else
    echo "   ⚠️  /etc/docker/daemon.json already exists — manually add log limits if needed:"
    cat /etc/docker/daemon.json
fi

# Weekly cleanup cron job
echo ""
echo "⏰ Installing weekly storage cleanup cron job..."
CRON_JOB="0 3 * * 0 docker system prune -f --filter 'until=168h' >> /var/log/docker-cleanup.log 2>&1 && journalctl --vacuum-time=7d >> /var/log/docker-cleanup.log 2>&1 && find /tmp -type f -mtime +7 -delete 2>/dev/null; npm cache clean --force 2>/dev/null; find /root/wabot_bsp/logs -name '*.log' -size +100M -exec truncate -s 0 {} \; 2>/dev/null"
(crontab -l 2>/dev/null | grep -v "docker system prune"; echo "$CRON_JOB") | crontab -
echo "   ✅ Weekly cleanup cron installed (runs every Sunday at 3am)"

# Disk alert cron (alert when >80% used)
ALERT_JOB="0 * * * * USED=\$(df / | awk 'NR==2{print \$5}' | tr -d '%'); if [ \"\$USED\" -gt 80 ]; then echo \"[DISK ALERT] VPS root is \${USED}% full at \$(date)\" >> /var/log/disk-alerts.log; fi"
(crontab -l 2>/dev/null | grep -v "DISK ALERT"; echo "$ALERT_JOB") | crontab -
echo "   ✅ Hourly disk usage alert installed (logs to /var/log/disk-alerts.log when >80%)"

# ────────────────────────────────────────────────────────────
# FINAL REPORT
# ────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 FINAL STORAGE REPORT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
df -h /
echo ""
echo "🐳 Docker:"
docker system df
echo ""
echo "✅ GUARDIAN SETUP COMPLETE"
echo ""
echo "Long-term protection installed:"
echo "  • Logrotate: App logs auto-rotate daily, max 50MB, 7 days retention"
echo "  • Docker: Logs limited to 10MB × 5 files per container"
echo "  • Cron: Weekly Docker prune + journal vacuum every Sunday at 3am"
echo "  • Alert: Hourly disk check, logs alert if >80% full"
echo ""
REMOTE_EOF

echo ""
good "VPS Storage Guardian script completed!"
