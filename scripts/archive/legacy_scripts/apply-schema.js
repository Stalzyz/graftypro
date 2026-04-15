// Simple migration using Prisma db push
// This syncs the schema to the database without creating migration files

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Applying WhatsApp Integration Schema...\n');

try {
    // Use the local Prisma installation
    const prismaPath = path.join(__dirname, '../node_modules/.bin/prisma');

    console.log('📊 Syncing schema to database...');
    console.log('⚠️  This will update your database to match prisma/schema.prisma\n');

    // Run prisma db push
    const result = execSync('npx prisma db push --skip-generate', {
        cwd: path.join(__dirname, '..'),
        stdio: 'inherit',
        env: { ...process.env, npm_config_cache: '/tmp/grafty_npm' }
    });

    console.log('\n✅ Schema synchronized successfully!');
    console.log('\n📋 Changes applied:');
    console.log('   - Added 4 new enums');
    console.log('   - Enhanced whatsapp_accounts table');
    console.log('   - Created integration_health_logs table');
    console.log('   - Created integration_audit_logs table');
    console.log('\n🎉 Phase 1 migration complete!');

} catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nPlease try manually:');
    console.error('  npx prisma db push');
    process.exit(1);
}
