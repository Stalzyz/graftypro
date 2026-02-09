# Phase 1 Migration - Manual Application Guide

## 🚨 NPM Permission Issue Detected

We encountered npm cache permission issues. Here are your options:

---

## Option 1: Fix NPM Permissions (Recommended)

Run this command in your terminal:

```bash
sudo chown -R 501:20 "/Users/stalinkumar/.npm"
```

Then retry the migration:

```bash
cd /Users/stalinkumar/Downloads/Wabot_BSP
npx tsx scripts/migrate-whatsapp-integration.ts
```

---

## Option 2: Apply Migration Manually via Database Client

If you have a PostgreSQL client (pgAdmin, DBeaver, etc.):

1. Connect to your database: `postgresql://user:password@localhost:5432/wabot_bsp`

2. Run the SQL file:
   ```
   prisma/migrations/20260205_enhance_whatsapp_integration/migration.sql
   ```

---

## Option 3: Use Docker/Existing Node Process

If your app is already running or you have node_modules installed:

```bash
cd /Users/stalinkumar/Downloads/Wabot_BSP
node -e "
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const prisma = new PrismaClient();

async function migrate() {
  const sql = fs.readFileSync('prisma/migrations/20260205_enhance_whatsapp_integration/migration.sql', 'utf-8');
  const statements = sql.split(';').filter(s => s.trim() && !s.startsWith('--'));
  
  for (const stmt of statements) {
    try {
      await prisma.\$executeRawUnsafe(stmt);
      console.log('✅ Executed');
    } catch (e) {
      if (e.message.includes('already exists')) {
        console.log('⚠️  Already exists');
      } else {
        throw e;
      }
    }
  }
  
  await prisma.\$disconnect();
  console.log('✅ Migration complete!');
}

migrate();
"
```

---

## Option 4: Generate Prisma Client Without Migration

If you just want to proceed with development:

```bash
# This will update the Prisma client types without running migrations
npx prisma generate
```

Then manually apply the SQL later when you have database access.

---

## ✅ What's Been Completed So Far

### Phase 1 Progress: 80%

- [x] ✅ Updated Prisma schema with enhanced WhatsAppAccount model
- [x] ✅ Added IntegrationHealthLog model  
- [x] ✅ Added IntegrationAuditLog model
- [x] ✅ Added new enums (IntegrationStatus, HealthStatus, HealthCheckType, AuditAction)
- [x] ✅ Created migration SQL file
- [x] ✅ Created encryption utility functions
- [x] ✅ Added ENCRYPTION_KEY to environment
- [ ] ⏳ Apply migration to database (blocked by npm permissions)
- [ ] ⏳ Generate Prisma client
- [ ] ⏳ Test database changes

---

## 🎯 Next Steps

**Choose one of the options above to complete the migration**, then we can:

1. Generate the Prisma client
2. Test the new schema
3. Move to Phase 2 (Validation Engine)

---

## 📊 Migration Summary

The migration will add:

### New Enums (4)
- `IntegrationStatus` - Lifecycle states (DRAFT, VALIDATING, ACTIVE, etc.)
- `HealthStatus` - Health states (HEALTHY, WARNING, CRITICAL, UNKNOWN)
- `HealthCheckType` - Types of health checks
- `AuditAction` - Audit log action types

### Enhanced whatsapp_accounts Table (18 new columns)
- Integration & health status fields
- Meta credentials (app_id, app_secret, business_id)
- Webhook configuration
- Permission tracking
- Health metrics
- Audit trail fields

### New Tables (2)
- `integration_health_logs` - Health check history
- `integration_audit_logs` - Complete audit trail

### Indexes (3)
- Performance indexes for time-series queries

---

## 🔧 Troubleshooting

### If migration fails with "already exists"
This is safe - it means the schema is already updated.

### If you get "relation does not exist"
The migration hasn't been applied yet. Use one of the options above.

### If Prisma client is out of sync
Run: `npx prisma generate`

---

**Let me know which option you'd like to use, or if you need help with any of them!**
