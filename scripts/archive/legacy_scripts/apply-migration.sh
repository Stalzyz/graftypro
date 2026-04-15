#!/bin/bash

# Simple migration script that applies SQL directly
# This avoids all npm/node permission issues

echo "🚀 WhatsApp Integration Migration"
echo "=================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo ""
    echo "Please set it in your .env file or export it:"
    echo "  export DATABASE_URL='postgresql://user:password@localhost:5432/grafty_bsp'"
    exit 1
fi

echo "📄 Reading migration SQL..."
MIGRATION_FILE="prisma/migrations/20260205_enhance_whatsapp_integration/migration.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ ERROR: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "✅ Migration file found"
echo ""
echo "⚠️  This will modify your database schema"
echo "   Database: $DATABASE_URL"
echo ""
echo "📊 Applying migration..."
echo ""

# Try different PostgreSQL client commands
if command -v psql &> /dev/null; then
    # Use psql if available
    psql "$DATABASE_URL" -f "$MIGRATION_FILE"
    EXIT_CODE=$?
elif command -v docker &> /dev/null; then
    # Try docker if psql not available
    echo "⚠️  psql not found, trying docker..."
    docker run --rm -i postgres:latest psql "$DATABASE_URL" < "$MIGRATION_FILE"
    EXIT_CODE=$?
else
    echo "❌ ERROR: No PostgreSQL client found"
    echo ""
    echo "Options:"
    echo "  1. Install PostgreSQL: brew install postgresql"
    echo "  2. Use Docker: docker run --rm -i postgres:latest psql \"\$DATABASE_URL\" < $MIGRATION_FILE"
    echo "  3. Use a GUI client (pgAdmin, DBeaver) to run the SQL file"
    echo "  4. Copy the SQL and run it manually in your database"
    echo ""
    echo "Migration SQL location: $MIGRATION_FILE"
    exit 1
fi

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📋 Summary:"
    echo "   - Added 4 new enums"
    echo "   - Enhanced whatsapp_accounts table"
    echo "   - Created integration_health_logs table"
    echo "   - Created integration_audit_logs table"
    echo "   - Added performance indexes"
    echo ""
    echo "🎉 Phase 1 database migration complete!"
else
    echo ""
    echo "❌ Migration failed with exit code: $EXIT_CODE"
    echo ""
    echo "This might mean:"
    echo "  - Database is not accessible"
    echo "  - Migration already applied (check for 'already exists' errors)"
    echo "  - Connection string is incorrect"
    exit $EXIT_CODE
fi
