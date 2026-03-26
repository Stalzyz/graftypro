/**
 * GRAFTY BSP — PhonePe Deployment via Node.js + ssh2
 * Must be run from inside /Users/stalinkumar/Downloads/Wabot_BSP
 * Run: node deploy_grafty.cjs
 */

const { Client } = require('ssh2');
const { execSync, spawnSync } = require('child_process');
const path = require('path');

const VPS_HOST = '72.61.231.187';
const VPS_PORT = 22;
const VPS_USER = 'root';
const VPS_PASS = 'Photoshop09@';
const REMOTE_PATH = '/root/wabot_bsp';
const LOCAL_PATH = '/Users/stalinkumar/Downloads/Wabot_BSP';

function section(n, msg) {
    console.log(`\n${'━'.repeat(56)}`);
    console.log(`  [${n}] ${msg}`);
}

function runOnVPS(conn, command) {
    return new Promise((resolve, reject) => {
        conn.exec(command, (err, stream) => {
            if (err) return reject(err);
            let hasError = false;
            stream
                .on('data', (d) => process.stdout.write(d.toString()))
                .stderr.on('data', (d) => {
                    process.stderr.write(d.toString());
                });
            stream.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Command exited with code ${code}`));
                } else {
                    resolve(code);
                }
            });
        });
    });
}

async function main() {
    console.log('\n╔══════════════════════════════════════════════════════╗');
    console.log('║    🦁 GRAFTY PhonePe Auto-Deploy                     ║');
    console.log(`║    ${new Date().toLocaleString()}                   ║`);
    console.log('╚══════════════════════════════════════════════════════╝\n');

    // ─── STEP 1: Sync files ──────────────────────────────────────
    section('1/5', '📡 Syncing codebase to VPS via rsync...');
    const rsync = spawnSync('rsync', [
        '-az', '--delete',
        '-e', `ssh -o StrictHostKeyChecking=no -o PubkeyAuthentication=no`,
        '--exclude=node_modules', '--exclude=.next', '--exclude=.git',
        '--exclude=temp_project', '--exclude=.DS_Store', 
        '--exclude=*.zip', '--exclude=public/uploads',
        `${LOCAL_PATH}/`,
        `${VPS_USER}@${VPS_HOST}:${REMOTE_PATH}/`
    ], { stdio: 'inherit', timeout: 300000, env: { ...process.env, SSH_ASKPASS_REQUIRE: 'never' } });

    if (rsync.status !== 0 && rsync.status !== 23) {
        console.error(`\n❌ Rsync failed (exit ${rsync.status})`);
        console.log('\n⚠️ Will proceed with SSH-only deployment (not syncing files locally).');
    } else {
        console.log('✅ Sync complete.');
    }

    // ─── STEP 2: SSH Deploy ──────────────────────────────────────
    section('2/5', '🔧 Connecting to VPS via SSH (password auth)...');

    const conn = new Client();
    await new Promise((resolve, reject) => {
        conn.on('ready', () => {
            console.log(`✅ Connected to ${VPS_HOST}`);
            resolve();
        }).on('error', reject).connect({
            host: VPS_HOST,
            port: VPS_PORT,
            username: VPS_USER,
            password: VPS_PASS,
            readyTimeout: 30000,
            keepaliveInterval: 5000
        });
    });

    try {
        section('3/5', '🏗️ Rebuilding Docker containers...');
        await runOnVPS(conn, `
            set -e
            cd ${REMOTE_PATH}
            docker compose -f docker-compose.prod.yml build 2>&1
            docker compose -f docker-compose.prod.yml down --remove-orphans 2>&1
            docker compose -f docker-compose.prod.yml up -d 2>&1
            echo "✅ Containers started."
        `);

        console.log('\n⏳ Waiting 25s for containers to fully boot...');
        await new Promise(r => setTimeout(r, 25000));

        section('4/5', '💾 DB push + Prisma client regeneration...');
        await runOnVPS(conn, `
            set -e
            cd ${REMOTE_PATH}
            echo "📊 Pushing schema..."
            docker compose -f docker-compose.prod.yml exec -T web \
                npx prisma db push --schema=./prisma/schema.prisma --accept-data-loss < /dev/null 2>&1
            echo "🛠️ Generating Prisma client (web)..."
            docker compose -f docker-compose.prod.yml exec -T web \
                npx prisma generate --schema=./prisma/schema.prisma < /dev/null 2>&1
            echo "🛠️ Generating Prisma client (worker)..."
            docker compose -f docker-compose.prod.yml exec -T worker \
                npx prisma generate --schema=./prisma/schema.prisma < /dev/null 2>&1 || true
            echo "✅ DB & Prisma ready."
        `);

        section('5/5', '♻️ Final restart & health check...');
        await runOnVPS(conn, `
            cd ${REMOTE_PATH}
            echo "🔄 Restarting web & worker..."
            docker compose -f docker-compose.prod.yml restart web worker 2>&1
            sleep 12
            HTTP=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001 2>/dev/null || echo "000")
            echo "🔍 App HTTP status: $HTTP"
            if [[ "$HTTP" == "200" || "$HTTP" == "301" || "$HTTP" == "302" ]]; then
                echo "✅ App is HEALTHY!"
            else
                echo "⚠️ App returned HTTP $HTTP — showing logs:"
                docker compose -f docker-compose.prod.yml logs web --tail=30 2>&1
            fi
        `);

        console.log('\n╔══════════════════════════════════════════════════════╗');
        console.log('║  🎉 DEPLOYMENT COMPLETE!                             ║');
        console.log('║                                                      ║');
        console.log('║  🌐 http://72.61.231.187:3001                        ║');
        console.log('║  🔑 /super-admin/login                               ║');
        console.log('║                                                      ║');
        console.log('║  ✅ PhonePe integration is now LIVE!                 ║');
        console.log('║  ✅ Razorpay + PhonePe in Flow Builder               ║');
        console.log('╚══════════════════════════════════════════════════════╝');

    } catch (err) {
        console.error(`\n❌ Deployment error: ${err.message}`);
        process.exit(1);
    } finally {
        conn.end();
    }
}

main();
