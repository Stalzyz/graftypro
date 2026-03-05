# 🔥 PRODUCTION CLEANUP & HARDENING REPORT
**Generated:** 2026-02-14  
**Project:** Grafty WhatsApp Commerce Platform  
**Environment:** Production VPS (grafty.pro)

---

## 📊 EXECUTIVE SUMMARY

**Current Status:** Development artifacts present in production  
**Risk Level:** MEDIUM  
**Cleanup Priority:** HIGH  
**Estimated Cleanup:** ~150+ files, ~50MB+ disk space

---

## 🎯 PHASE 1: FILES TO REMOVE

### 1.1 Development Documentation (Safe to Remove)
```
✗ CREDIT_WALLET_*.md (7 files) - Old feature docs
✗ API_SPEC.md - Development reference
✗ ARCHITECTURE.md - Internal docs
✗ DATABASE_SCHEMA.md - Internal docs
✗ DEPLOYMENT_CHECKLIST.md - Already deployed
✗ SUPER_ADMIN_ALIGNMENT.md - Internal planning
✗ MONSTER_MODE_QA_RESULTS.md - QA artifact
✗ docs/ folder - All internal documentation
✗ temp_project/ - Temporary folder
```

### 1.2 Deployment Scripts (Consolidate)
```
✗ DEPLOY_AUTO.exp - Redundant
✗ DEPLOY_INTERACTIVE.sh - Redundant
✗ deploy.sh - Old version
✗ setup-vps.sh - Already set up
✗ setup-ssh-key.sh - Already configured
✗ APPLY_MIGRATION_NOW.md - One-time use
✗ CHECK_ADMINS.exp - Debug script
✗ CLEANUP_ALL_OLD.exp - Ironic
✗ LIST_NGINX_FILES.exp - Debug script
✗ REMOTE_EXEC.exp - Debug script
✗ RUN_AUDIT.exp - Debug script
✗ SEARCH_OLD_DOMAIN.exp - Debug script
✗ SEED_*.exp (3 files) - Database seeding (keep for now)
✗ UPDATE_*.exp (2 files) - One-time scripts
✗ REMOVE_OLD_DOMAIN.exp - One-time script
✗ SETUP_DOMAIN.exp - One-time script
✗ SETUP_GRAFTY_DOMAIN.exp - One-time script

KEEP ONLY:
✓ DEPLOY_NOW.sh - Primary deployment script
✓ FIX_DOMAIN.sh - Utility script
✓ NUCLEAR_UPLOAD_FIX.sh - Emergency fix script
```

### 1.3 Temporary/Output Files
```
✗ analytics_output.txt
✗ api_output.txt
✗ analytics_update.zip
✗ Capture/ - Screenshot folder
✗ Wabot_BSP.code-workspace - VS Code workspace file
```

### 1.4 Unused App Components
```
AUDIT NEEDED:
- app/components/auth/ - Check if all components used
- app/(auth)/ - Verify all routes active
- Old authentication routes (if any)
```

---

## 🗄️ PHASE 2: DATABASE CLEANUP

### 2.1 Tables to Audit
```sql
-- Check for orphaned records
SELECT COUNT(*) FROM users WHERE workspace_id NOT IN (SELECT id FROM workspaces);
SELECT COUNT(*) FROM campaigns WHERE workspace_id NOT IN (SELECT id FROM workspaces);

-- Check for test data
SELECT * FROM users WHERE email LIKE '%test%' OR email LIKE '%demo%';
SELECT * FROM admin_users WHERE email LIKE '%test%';

-- Check for expired OTPs
SELECT COUNT(*) FROM otp_codes WHERE expires_at < NOW();

-- Check for old audit logs (older than 90 days)
SELECT COUNT(*) FROM security_audit_logs WHERE created_at < NOW() - INTERVAL '90 days';

-- Check for orphaned remember_me tokens
SELECT COUNT(*) FROM remember_me_tokens WHERE expires_at < NOW();
```

### 2.2 Cleanup Actions
```sql
-- Remove expired OTPs
DELETE FROM otp_codes WHERE expires_at < NOW();

-- Remove expired remember_me tokens
DELETE FROM remember_me_tokens WHERE expires_at < NOW();

-- Archive old audit logs (optional - keep for compliance)
-- DELETE FROM security_audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
```

---

## 🔒 PHASE 3: ENVIRONMENT HARDENING

### 3.1 .env Security Audit
```bash
# Current Issues:
❌ DATABASE_URL contains "grafty_bsp" (should be wabot_bsp)
❌ JWT_SECRET is weak ("development-secret-key...")
❌ ADMIN_JWT_SECRET is weak
⚠️  ENCRYPTION_KEY - Verify strength
⚠️  Razorpay keys are test keys

# Required Actions:
1. Generate strong JWT secrets (64+ characters)
2. Update DATABASE_URL to use wabot_bsp
3. Verify ENCRYPTION_KEY is production-grade
4. Update Razorpay to live keys when ready
5. Remove any .env.backup or .env.example files
```

### 3.2 Environment Variables to Add
```bash
# Production optimizations
NODE_ENV=production
APP_ENV=production
LOG_LEVEL=error
NEXT_TELEMETRY_DISABLED=1

# Security headers
SECURE_COOKIES=true
CSRF_PROTECTION=true
```

---

## 📦 PHASE 4: DEPENDENCY OPTIMIZATION

### 4.1 NPM Packages Audit
```bash
# Run on local:
npm audit
npm audit fix

# Check for unused dependencies:
npx depcheck

# Remove dev dependencies from production:
# (Already handled by Dockerfile)
```

### 4.2 Docker Image Optimization
```dockerfile
# Current Dockerfile is good, but verify:
✓ Multi-stage build
✓ Production dependencies only
✓ Prisma client generated
✓ Next.js optimized build

# Potential improvements:
- Add .dockerignore for docs/, *.md, *.exp
- Reduce layer count if possible
```

---

## 🚀 PHASE 5: PERFORMANCE OPTIMIZATION

### 5.1 Next.js Optimizations
```javascript
// next.config.js additions:
{
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },
  
  experimental: {
    optimizeCss: true,
  }
}
```

### 5.2 Database Indexing
```sql
-- Verify these indexes exist:
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_workspace_id ON users(workspace_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_workspace_id ON campaigns(workspace_id);
CREATE INDEX IF NOT EXISTS idx_otp_codes_email_expires ON otp_codes(email, expires_at);
CREATE INDEX IF NOT EXISTS idx_security_audit_created ON security_audit_logs(created_at);
```

### 5.3 Redis Optimization
```bash
# Verify Redis is configured for production:
maxmemory 256mb
maxmemory-policy allkeys-lru
```

---

## 🛡️ PHASE 6: SECURITY HARDENING

### 6.1 File Permissions (VPS)
```bash
# Verify correct permissions:
chmod 755 /root/wabot_bsp
chmod 644 /root/wabot_bsp/.env
chmod 600 /root/wabot_bsp/.env  # Even more restrictive

# Nginx config:
chmod 644 /etc/nginx/sites-available/grafty.pro.conf
```

### 6.2 Nginx Security Headers
```nginx
# Add to grafty.pro.conf:
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), microphone=(), camera=()" always;

# Remove server header:
server_tokens off;
```

### 6.3 Firewall Rules
```bash
# Verify UFW is active:
sudo ufw status

# Should only allow:
22/tcp (SSH)
80/tcp (HTTP)
443/tcp (HTTPS)
```

---

## 🧹 PHASE 7: VPS CLEANUP

### 7.1 Docker Cleanup
```bash
# Remove unused images:
docker image prune -a

# Remove unused volumes:
docker volume prune

# Remove unused networks:
docker network prune

# Remove build cache:
docker builder prune
```

### 7.2 System Cleanup
```bash
# Remove old logs:
sudo journalctl --vacuum-time=7d

# Clean apt cache:
sudo apt-get clean
sudo apt-get autoclean
sudo apt-get autoremove

# Check disk usage:
df -h
du -sh /root/wabot_bsp/*
```

---

## 📈 PHASE 8: MONITORING & LOGGING

### 8.1 Log Rotation
```bash
# Create /etc/logrotate.d/docker-containers:
/var/lib/docker/containers/*/*.log {
  rotate 7
  daily
  compress
  missingok
  delaycompress
  copytruncate
}
```

### 8.2 Application Logging
```typescript
// Ensure production logging is minimal:
if (process.env.NODE_ENV === 'production') {
  console.log = () => {}; // Disable debug logs
  console.debug = () => {};
}
```

---

## ✅ CLEANUP EXECUTION PLAN

### Step 1: Backup Everything
```bash
# On VPS:
cd /root
tar -czf wabot_bsp_backup_$(date +%Y%m%d).tar.gz wabot_bsp/
pg_dump -U user wabot_bsp > wabot_bsp_db_backup_$(date +%Y%m%d).sql
```

### Step 2: Remove Local Files
```bash
# On Mac:
cd /Users/stalinkumar/Downloads/Wabot_BSP

# Remove docs
rm -rf docs/ temp_project/

# Remove old deployment scripts
rm DEPLOY_AUTO.exp DEPLOY_INTERACTIVE.sh deploy.sh
rm setup-vps.sh setup-ssh-key.sh
rm CHECK_ADMINS.exp CLEANUP_ALL_OLD.exp LIST_NGINX_FILES.exp
rm REMOTE_EXEC.exp RUN_AUDIT.exp SEARCH_OLD_DOMAIN.exp
rm UPDATE_*.exp REMOVE_OLD_DOMAIN.exp SETUP_*.exp

# Remove documentation
rm CREDIT_WALLET_*.md API_SPEC.md ARCHITECTURE.md
rm DATABASE_SCHEMA.md DEPLOYMENT_CHECKLIST.md
rm SUPER_ADMIN_ALIGNMENT.md MONSTER_MODE_QA_RESULTS.md
rm APPLY_MIGRATION_NOW.md

# Remove temp files
rm analytics_output.txt api_output.txt analytics_update.zip
rm -rf Capture/
rm Wabot_BSP.code-workspace
```

### Step 3: Update .env
```bash
# Generate strong secrets:
openssl rand -base64 64  # For JWT_SECRET
openssl rand -base64 64  # For ADMIN_JWT_SECRET

# Update DATABASE_URL to wabot_bsp
```

### Step 4: Database Cleanup
```bash
# On VPS:
docker compose -f docker-compose.prod.yml exec postgres psql -U user -d wabot_bsp

# Run cleanup queries from Phase 2
```

### Step 5: VPS Cleanup
```bash
# On VPS:
docker system prune -a
sudo journalctl --vacuum-time=7d
sudo apt-get autoremove
```

### Step 6: Deploy Clean Version
```bash
# On Mac:
bash DEPLOY_NOW.sh
```

---

## 📊 EXPECTED RESULTS

### Before Cleanup:
- **Project Size:** ~500MB (with node_modules)
- **Files:** ~5,000+
- **Docker Images:** Multiple old versions
- **Database Size:** Unknown (needs audit)

### After Cleanup:
- **Project Size:** ~450MB (cleaner structure)
- **Files:** ~4,800 (removed ~200 unnecessary files)
- **Docker Images:** Only latest production image
- **Database Size:** Optimized (removed expired records)

### Performance Improvements:
- ✅ Faster deployments (fewer files to sync)
- ✅ Cleaner codebase (easier maintenance)
- ✅ Better security (no exposed docs/scripts)
- ✅ Optimized database (indexed, cleaned)
- ✅ Hardened environment (strong secrets, headers)

---

## 🎯 PRIORITY ACTIONS (DO NOW)

1. **CRITICAL:** Update .env with strong JWT secrets
2. **CRITICAL:** Fix DATABASE_URL to use wabot_bsp
3. **HIGH:** Remove all .exp and old .sh scripts
4. **HIGH:** Remove docs/ and temp_project/ folders
5. **MEDIUM:** Clean database (expired OTPs, tokens)
6. **MEDIUM:** Add Nginx security headers
7. **LOW:** Docker cleanup on VPS

---

## 🚨 SAFETY CHECKLIST

Before executing cleanup:
- [ ] Full VPS backup created
- [ ] Database backup created
- [ ] .env file backed up
- [ ] Tested deployment script works
- [ ] Verified no active users during cleanup
- [ ] Nginx config backed up

---

**Next Steps:** Review this report and approve cleanup execution.
